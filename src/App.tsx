/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';

import { LandingPage } from './pages/LandingPage';
import { RestaurantsPage } from './pages/RestaurantsPage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { DeliveryDashboard } from './pages/DeliveryDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Order, UserRole } from './types';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('rest_pizza_1');
  const [searchParam, setSearchParam] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    if (param) setSearchParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRestaurant = (id: string) => {
    setSelectedRestaurantId(id);
    setCurrentView('restaurant-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (role: UserRole) => {
    switch (role) {
      case 'restaurant':
        setCurrentView('restaurant-dashboard');
        break;
      case 'delivery':
        setCurrentView('delivery-dashboard');
        break;
      case 'admin':
        setCurrentView('admin-dashboard');
        break;
      default:
        setCurrentView('customer-dashboard');
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (order: Order) => {
    setTrackingOrder(order);
    setCurrentView('customer-dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectRestaurant={handleSelectRestaurant}
          />
        )}

        {currentView === 'restaurants' && (
          <RestaurantsPage
            initialSearch={searchParam}
            onSelectRestaurant={handleSelectRestaurant}
          />
        )}

        {currentView === 'restaurant-detail' && (
          <RestaurantDetailPage
            restaurantId={selectedRestaurantId}
            onBack={() => setCurrentView('restaurants')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onNavigate={handleNavigate}
            onRegisterSuccess={handleLoginSuccess}
          />
        )}

        {currentView === 'customer-dashboard' && (
          <CustomerDashboard
            onNavigateToRestaurants={() => setCurrentView('restaurants')}
            onSelectRestaurant={handleSelectRestaurant}
          />
        )}

        {currentView === 'restaurant-dashboard' && <RestaurantDashboard />}

        {currentView === 'delivery-dashboard' && <DeliveryDashboard />}

        {currentView === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onNavigateToRestaurants={() => setCurrentView('restaurants')}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      {trackingOrder && (
        <OrderTrackingModal
          order={trackingOrder}
          isOpen={!!trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onOrderUpdated={(updated) => setTrackingOrder(updated)}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
