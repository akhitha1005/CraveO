import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, roleOverride?: UserRole) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    restaurantName?: string;
    vehicleType?: string;
  }) => Promise<User>;
  switchRoleDemo: (role: UserRole) => Promise<User>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_EMAILS: Record<UserRole, string> = {
  customer: 'customer@craveo.com',
  restaurant: 'restaurant@craveo.com',
  delivery: 'delivery@craveo.com',
  admin: 'admin@craveo.com',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    const saved = localStorage.getItem('craveo_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    } else {
      // Default initial session: Customer
      login('customer@craveo.com', 'password', 'customer').catch(() => {});
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password?: string, roleOverride?: UserRole): Promise<User> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: roleOverride }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data.user);
      localStorage.setItem('craveo_user', JSON.stringify(data.user));
      return data.user;
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
    restaurantName?: string;
    vehicleType?: string;
  }): Promise<User> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Registration failed');
    }
    setUser(result.user);
    localStorage.setItem('craveo_user', JSON.stringify(result.user));
    return result.user;
  };

  const switchRoleDemo = async (targetRole: UserRole): Promise<User> => {
    const demoEmail = DEMO_EMAILS[targetRole];
    return login(demoEmail, 'demo', targetRole);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('craveo_user');
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...updated };
    setUser(next);
    localStorage.setItem('craveo_user', JSON.stringify(next));
  };

  const role = user?.role || 'customer';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        switchRoleDemo,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
