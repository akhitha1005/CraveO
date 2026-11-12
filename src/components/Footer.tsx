import React from 'react';
import { Phone, Mail, MapPin, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CraveOLogo } from './CraveOLogo';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { switchRoleDemo } = useAuth();

  return (
    <footer id="contact-us" className="bg-[#0F172A] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="text-left focus:outline-hidden"
            >
              <CraveOLogo size="md" inverted={true} />
            </button>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Good Food, Delivered Fresh. CraveO connects passionate local culinary masters, royal biryani dawkats, and hungry diners across India with seamless ordering, transparent tracking, and reliable delivery.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>24/7 Foodie Toll-Free Helpline: 1800 200 3456 / +91 80 4123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>support@craveo.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>4th Floor, Salarpuria Tech Point, 100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038</span>
              </div>
            </div>
          </div>

          {/* Customer Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Explore Cuisines</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('restaurants')} className="hover:text-orange-400 transition-colors">
                  Hyderabadi Dum Biryanis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('restaurants')} className="hover:text-orange-400 transition-colors">
                  Butter Chicken & Garlic Naan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('restaurants')} className="hover:text-orange-400 transition-colors">
                  Ghee Mysore Masala Dosas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('restaurants')} className="hover:text-orange-400 transition-colors">
                  Pure Vegetarian Thalis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer-dashboard')} className="hover:text-orange-400 transition-colors">
                  Track Live Active Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Partner & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Partner Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    switchRoleDemo('restaurant');
                    onNavigate('restaurant-dashboard');
                  }}
                  className="hover:text-orange-400 transition-colors flex items-center gap-1 text-left"
                >
                  Restaurant Dashboard <ArrowRight className="w-3 h-3 text-orange-400" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    switchRoleDemo('delivery');
                    onNavigate('delivery-dashboard');
                  }}
                  className="hover:text-orange-400 transition-colors flex items-center gap-1 text-left"
                >
                  Delivery Partner Portal <ArrowRight className="w-3 h-3 text-orange-400" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    switchRoleDemo('admin');
                    onNavigate('admin-dashboard');
                  }}
                  className="hover:text-orange-400 transition-colors flex items-center gap-1 text-left"
                >
                  Administrator Console <ArrowRight className="w-3 h-3 text-orange-400" />
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-orange-400 transition-colors">
                  Register as Restaurant Partner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-orange-400 transition-colors">
                  Ride with CraveO Fleet
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CraveO Food Technologies India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">FSSAI Certified</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>for authentic Indian food lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
