import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, Banknote, ShieldCheck, MapPin, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { DeliveryAddress, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderPlaced }) => {
  const { items, restaurantId, restaurantName, deliveryFee, subtotal, tax, tip, discount, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    id: 'addr_checkout',
    label: 'Home',
    street: 'Flat 402, Sai Residency, Road No. 12, Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    zipCode: '500034',
    landmark: 'Near Care Hospital',
    isDefault: true,
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'cod'>('upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8829');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('342');
  const [upiId, setUpiId] = useState('akhitha@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || items.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.zipCode) {
      setErrorMsg('Please complete your delivery address');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customerId: user?.id || 'user_guest',
        customerName: user?.name || 'Akhitha Vangari',
        customerPhone: user?.phone || '+91 98490 23456',
        deliveryAddress,
        restaurantId,
        restaurantName: restaurantName || 'Partner Restaurant',
        items: items.map((i) => ({
          foodItemId: i.foodItem.id,
          name: i.foodItem.name,
          price: i.foodItem.price,
          quantity: i.quantity,
          isVeg: i.foodItem.isVeg,
          image: i.foodItem.image,
          subtotal: parseFloat((i.foodItem.price * i.quantity).toFixed(2)),
        })),
        subtotal,
        deliveryFee,
        tax,
        tip,
        discount,
        totalAmount,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#f97316', '#fbbf24', '#10b981'],
        });
      } catch (err) {
        // ignore confetti errors
      }

      clearCart();
      setIsSubmitting(false);
      onClose();
      onOrderPlaced(data.order);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 bg-[#FFFDF9] border-b border-orange-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Checkout & Payment</h3>
            <p className="text-xs text-slate-500">
              Ordering from <strong className="text-orange-600">{restaurantName}</strong> · Total: ₹{totalAmount}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 1. Delivery Address Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>1. Delivery Address (India)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Flat / House No. & Street Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                  placeholder="e.g. Flat 402, Sai Residency, Road No. 12, Banjara Hills"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">City</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                  placeholder="e.g. Hyderabad / Bengaluru / Mumbai"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">PIN Code (6 digits)</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress.zipCode}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                  placeholder="500034"
                  maxLength={6}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Landmark / Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryAddress.landmark || ''}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                  placeholder="e.g. Leave with doorman or ring doorbell #4"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Gateway Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Simulated Secure Payment Gateway</span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50/60 text-orange-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'upi'
                    ? 'border-orange-500 bg-orange-50/60 text-orange-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'netbanking'
                    ? 'border-orange-500 bg-orange-50/60 text-orange-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === 'cod'
                    ? 'border-orange-500 bg-orange-50/60 text-orange-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash on Delivery</span>
              </button>
            </div>

            {/* Dynamic Payment Details */}
            <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-slate-200/70 space-y-3">
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 bg-white rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 bg-white rounded-lg focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 bg-white rounded-lg focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    256-Bit SSL simulated encrypted transaction. No real money charged.
                  </p>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-600 block">Virtual Payment Address (VPA / UPI ID)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="flex-1 px-3 py-2 text-xs font-mono border border-slate-200 bg-white rounded-lg focus:outline-hidden focus:border-orange-500"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg"
                    >
                      Verify VPA
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports Google Pay, PhonePe, Paytm, BHIM and standard UPI.
                  </p>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-600 block">Choose Your Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg focus:outline-hidden focus:border-orange-500"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">Cash on Delivery (COD) / UPI on Delivery</p>
                  <p className="text-xs text-slate-500">
                    Pay exact cash (₹{totalAmount}) or scan the delivery partner's QR code upon arrival.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Compact Order Summary */}
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{items.length} items</span>
              <span className="font-mono font-medium">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery partner fee + GST</span>
              <span className="font-mono font-medium">₹{deliveryFee + tax}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Promotional Discount</span>
                <span className="font-mono">-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-orange-200">
              <span>Total Payable</span>
              <span className="text-orange-600 font-mono text-base">₹{totalAmount}</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Order & Alerting Kitchen...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Confirm & Pay ₹{totalAmount}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
