import React, { useState } from 'react';
import { Lock, Mail, Phone, User, Store, Bike, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CraveOLogo } from '../components/CraveOLogo';
import { UserRole } from '../types';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
  onRegisterSuccess: (role: UserRole) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [restaurantName, setRestaurantName] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const user = await register({
        name,
        email,
        phone,
        password,
        role,
        restaurantName: role === 'restaurant' ? restaurantName : undefined,
        vehicleType: role === 'delivery' ? vehicleType : undefined,
      });

      setIsLoading(false);
      onRegisterSuccess(user.role);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-orange-950/5">
        <div className="text-center space-y-3 flex flex-col items-center">
          <CraveOLogo size="lg" />
          <p className="text-xs text-slate-500 pt-1">
            Join thousands of foodies, top Indian restaurants, and delivery drivers
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Role Selection Cards */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Select Your Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  role === 'customer'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-700 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-xs font-bold">Customer</span>
                <span className="text-[10px] text-slate-400">Order food</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('restaurant')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  role === 'restaurant'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-700 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Store className="w-4 h-4" />
                <span className="text-xs font-bold">Restaurant</span>
                <span className="text-[10px] text-slate-400">Sell dishes</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('delivery')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  role === 'delivery'
                    ? 'border-orange-500 bg-orange-50/70 text-orange-700 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span className="text-xs font-bold">Delivery</span>
                <span className="text-[10px] text-slate-400">Deliver & earn</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98490 12345"
                  className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Role specific input */}
          {role === 'restaurant' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Restaurant / Kitchen Name</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g. Dawat Royal Dum Biryani"
                  className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {role === 'delivery' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Delivery Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden bg-white"
              >
                <option value="Bike">Bicycle</option>
                <option value="Scooter">Motorcycle / Scooter</option>
                <option value="Car">Car</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already have a CraveO account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-orange-600 hover:text-orange-700 font-bold underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
