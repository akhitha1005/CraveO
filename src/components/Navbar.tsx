import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, LogOut, ChevronDown, ShieldCheck, Bike, Store, Sparkles, Menu, X, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CraveOLogo } from './CraveOLogo';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, role, isAuthenticated, logout, switchRoleDemo } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardView = (r: UserRole) => {
    switch (r) {
      case 'restaurant':
        return 'restaurant-dashboard';
      case 'delivery':
        return 'delivery-dashboard';
      case 'admin':
        return 'admin-dashboard';
      default:
        return 'customer-dashboard';
    }
  };

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    customer: { label: 'Customer', icon: <UserIcon className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    restaurant: { label: 'Restaurant', icon: <Store className="w-3.5 h-3.5" />, color: 'bg-orange-50 text-orange-800 border-orange-200' },
    delivery: { label: 'Delivery Partner', icon: <Bike className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-800 border-blue-200' },
    admin: { label: 'Administrator', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-purple-50 text-purple-800 border-purple-200' },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-orange-100/70 transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-[#0F172A] text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> CraveO Special Offer:
            </span>
            <span>Use coupon <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">CRAVEO100</strong> for ₹100 OFF on your meal!</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-300">
            <span>Quick Role Switch:</span>
            {(['customer', 'restaurant', 'delivery', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  switchRoleDemo(r);
                  onNavigate(getDashboardView(r));
                }}
                className={`text-[11px] px-2 py-0.5 rounded transition font-medium capitalize ${
                  user?.role === r
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-8">
          {/* Creative Brand Wordmark & Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="text-left focus:outline-hidden hover:opacity-95 transition"
              aria-label="CraveO Home"
            >
              <CraveOLogo size="md" />
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap ${
                currentView === 'home' ? 'text-orange-600 font-bold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('restaurants')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap ${
                currentView === 'restaurants' ? 'text-orange-600 font-bold' : ''
              }`}
            >
              Explore Restaurants
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-orange-600 transition-colors whitespace-nowrap"
            >
              About
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-orange-600 transition-colors whitespace-nowrap"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-xs animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Authenticated user actions or Login / Sign Up buttons */}
            {isAuthenticated && user ? (
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => onNavigate(getDashboardView(user.role))}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-xs"
                >
                  {roleLabels[user.role].icon}
                  <span>{roleLabels[user.role].label} Dashboard</span>
                </button>

                {/* User menu trigger */}
                <div className="relative">
                  <button
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="flex items-center gap-1.5 p-1.5 rounded-xl border border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50/50 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {roleMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-left"
                      onClick={() => setRoleMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className={`inline-flex items-center gap-1 mt-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${roleLabels[user.role].color}`}>
                          {roleLabels[user.role].icon}
                          {roleLabels[user.role].label}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => onNavigate(getDashboardView(user.role))}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          My Dashboard
                        </button>
                        <button
                          onClick={() => onNavigate('restaurants')}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"
                        >
                          <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                          Order Food
                        </button>
                      </div>

                      <div className="border-t border-slate-100 px-4 py-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Switch Role (Demo)
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['customer', 'restaurant', 'delivery', 'admin'] as UserRole[]).map((r) => (
                            <button
                              key={r}
                              onClick={(e) => {
                                e.stopPropagation();
                                switchRoleDemo(r);
                                onNavigate(getDashboardView(r));
                                setRoleMenuOpen(false);
                              }}
                              className={`text-[11px] px-2 py-1 rounded text-left font-medium capitalize truncate ${
                                user.role === r ? 'bg-orange-100 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            onNavigate('home');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-xs font-bold text-slate-800 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-orange-100 bg-[#FFFDF9] px-4 py-4 space-y-3 shadow-lg">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left font-semibold text-slate-700 py-2 hover:text-orange-600"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('restaurants');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left font-semibold text-slate-700 py-2 hover:text-orange-600"
          >
            Explore Restaurants
          </button>
          {isAuthenticated && user && (
            <button
              onClick={() => {
                onNavigate(getDashboardView(user.role));
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left font-semibold text-orange-600 py-2"
            >
              {roleLabels[user.role].label} Dashboard
            </button>
          )}
          {!isAuthenticated && (
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-bold text-slate-800 bg-slate-100 rounded-lg"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  onNavigate('register');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-bold text-white bg-orange-500 rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
