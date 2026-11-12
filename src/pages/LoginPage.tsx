import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CraveOLogo } from '../components/CraveOLogo';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (view: string) => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const user = await login(email, password);
      setIsLoading(false);
      onLoginSuccess(user.role);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Invalid credentials. Please verify and try again.');
    }
  };

  const handleQuickDemo = async (role: UserRole, demoEmail: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const user = await login(demoEmail, 'password', role);
      setIsLoading(false);
      onLoginSuccess(user.role);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Demo login failed');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail) {
      setForgotSuccess(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-orange-950/5">
        {/* Brand header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <CraveOLogo size="lg" />
          <p className="text-xs text-slate-500 pt-1">
            Sign in to access your role-based food delivery console
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Quick Demo Role Logins */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Or test instantly with 1-click demo roles:
          </p>
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer', 'customer@craveo.com')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition text-left"
            >
              <p className="text-xs font-bold text-emerald-900">Customer</p>
              <p className="text-[10px] text-emerald-700">Browse & order food</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('restaurant', 'restaurant@craveo.com')}
              className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100/60 transition text-left"
            >
              <p className="text-xs font-bold text-orange-900">Restaurant</p>
              <p className="text-[10px] text-orange-700">Kitchen & menu orders</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('delivery', 'delivery@craveo.com')}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition text-left"
            >
              <p className="text-xs font-bold text-blue-900">Delivery Partner</p>
              <p className="text-[10px] text-blue-700">Rider route & dropoffs</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin', 'admin@craveo.com')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition text-left"
            >
              <p className="text-xs font-bold text-purple-900">Administrator</p>
              <p className="text-[10px] text-purple-700">Platform & metrics</p>
            </button>
          </div>
        </div>

        {/* Link to Registration */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-orange-600 hover:text-orange-700 font-bold underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500">
              Enter your email address and we will simulate sending a password reset link.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password reset link sent to {forgotEmail}!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotSuccess(false);
                    }}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold text-white bg-orange-500 rounded-xl shadow-xs"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <button
                onClick={() => {
                  setForgotModalOpen(false);
                  setForgotSuccess(false);
                }}
                className="w-full py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
