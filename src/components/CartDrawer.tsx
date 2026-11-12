import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, Store, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CartDrawerProps {
  onOpenCheckout: () => void;
  onNavigateToRestaurants: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout, onNavigateToRestaurants }) => {
  const {
    items,
    restaurantName,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    tax,
    tip,
    setTipAmount,
    discount,
    appliedPromo,
    applyPromo,
    totalAmount,
    confirmReplaceModal,
    setConfirmReplaceModal,
    replaceCartWithPending,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput) return;
    const res = applyPromo(promoInput);
    setPromoMessage({ text: res.message, isError: !res.success });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FFFDF9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Your CraveO Order</h2>
                {restaurantName && (
                  <p className="text-xs text-orange-600 font-semibold flex items-center gap-1">
                    <Store className="w-3 h-3" /> {restaurantName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Your basket is hungry</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Explore top-rated artisan pizzas, smash burgers, and fresh bowls from local kitchens.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToRestaurants();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition"
                >
                  Browse Menu & Restaurants
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Order Items ({items.length})
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                  </button>
                </div>

                {items.map((item) => (
                  <div
                    key={item.foodItem.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-[#FCFBF9] hover:border-orange-200 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={item.foodItem.image}
                        alt={item.foodItem.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                      />
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              item.foodItem.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                            title={item.foodItem.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                          />
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.foodItem.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          ₹{item.foodItem.price} each
                        </p>
                        <p className="text-xs font-bold text-orange-600 font-mono mt-0.5">
                          ₹{item.foodItem.price * item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.foodItem.id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.foodItem.id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Promo Code Input */}
                <div className="pt-2">
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo coupon (e.g. CRAVEO100)"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden uppercase"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                    >
                      Apply
                    </button>
                  </form>
                  {promoMessage && (
                    <p
                      className={`text-[11px] mt-1 font-semibold ${
                        promoMessage.isError ? 'text-red-500' : 'text-emerald-600'
                      }`}
                    >
                      {promoMessage.text}
                    </p>
                  )}
                  {appliedPromo && (
                    <div className="mt-1 flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <span>Applied: <strong>{appliedPromo}</strong></span>
                      <span className="font-bold">-₹{discount}</span>
                    </div>
                  )}
                </div>

                {/* Tip Driver selector */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Tip your delivery partner:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[20, 30, 50, 0].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTipAmount(t)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                          tip === t
                            ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50'
                        }`}
                      >
                        {t === 0 ? 'No tip' : `₹${t}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-mono font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Partner Fee</span>
                    <span className="font-mono font-medium">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restaurant GST (5%)</span>
                    <span className="font-mono font-medium">₹{tax}</span>
                  </div>
                  {tip > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Partner Tip</span>
                      <span className="font-mono font-medium">₹{tip}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promotional Discount</span>
                      <span className="font-mono">-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                    <span>To Pay</span>
                    <span className="text-orange-600 font-mono text-base">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-[#FFFDF9] space-y-2">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Checkout</span>
                <span className="font-mono text-orange-200 font-normal">·</span>
                <span className="font-mono">₹{totalAmount}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Simulated secure checkout · Instant order routing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Replacement Modal */}
      {confirmReplaceModal.isOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900">Replace current order?</h3>
              <p className="text-xs text-slate-500">
                Your basket contains items from <strong>{restaurantName}</strong>. Adding this item from{' '}
                <strong>{confirmReplaceModal.pendingRestaurant?.name}</strong> will reset your cart.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmReplaceModal({ isOpen: false })}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Keep Current
              </button>
              <button
                onClick={replaceCartWithPending}
                className="flex-1 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs"
              >
                Replace & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
