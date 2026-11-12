import React, { useState } from 'react';
import { X, CheckCircle2, Clock, ChefHat, Bike, Home, Phone, Star, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: Order) => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
  { key: 'placed', label: 'Order Placed', desc: 'Received by CraveO system', icon: Clock },
  { key: 'confirmed', label: 'Order Confirmed', desc: 'Accepted by restaurant chef', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing Food', desc: 'Cooking fresh in the kitchen', icon: ChefHat },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Driver is on the way', icon: Bike },
  { key: 'delivered', label: 'Delivered Fresh', desc: 'Enjoy your meal!', icon: Home },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', cancellationReason: cancelReason }),
      });
      const data = await res.json();
      if (res.ok) {
        onOrderUpdated(data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  const handleSimulateNextStep = async () => {
    const nextSteps: Record<OrderStatus, OrderStatus> = {
      placed: 'confirmed',
      confirmed: 'preparing',
      preparing: 'out_for_delivery',
      out_for_delivery: 'delivered',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    const next = nextSteps[order.status];
    if (next === order.status) return;

    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (res.ok) {
        onOrderUpdated(data.order);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: order.customerId,
          userName: order.customerName,
          targetType: 'restaurant',
          targetId: order.restaurantId,
          orderId: order.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setReviewSuccess(true);
        onOrderUpdated({ ...order, reviewSubmitted: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Order #{order.orderNumber}
            </span>
            <h3 className="text-xl font-extrabold mt-1">Live Order Tracking</h3>
            <p className="text-xs text-orange-100 mt-0.5">
              From {order.restaurantName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Order Status Visualizer */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Order Cancelled</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Reason: {order.cancellationReason || 'Requested by customer'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Current Delivery Status
                  </p>
                  <p className="text-base font-extrabold text-slate-900 capitalize">
                    {order.status.replace(/_/g, ' ')}
                  </p>
                </div>
                {order.status !== 'delivered' && (
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-500">Estimated Delivery</span>
                    <p className="text-sm font-extrabold text-orange-600 font-mono">
                      ~{order.estimatedDeliveryMinutes} mins
                    </p>
                  </div>
                )}
              </div>

              {/* Step Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative flex items-start gap-3">
                      <div
                        className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                          isDone
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-200 text-slate-400'
                        } ${isCurrent ? 'animate-pulse ring-orange-200' : ''}`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="pl-2">
                        <p
                          className={`text-xs font-bold ${
                            isDone ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Demo accelerator button to test moving order forward */}
              {order.status !== 'delivered' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSimulateNextStep}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <span>Fast-Forward Status (Demo)</span> →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delivery Partner & Restaurant Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Restaurant</p>
                <p className="text-xs font-bold text-slate-800">{order.restaurantName}</p>
                <p className="text-[11px] text-slate-500">{order.restaurantPhone || '+91 98490 12345'}</p>
              </div>
              <a
                href={`tel:${order.restaurantPhone || '9849012345'}`}
                className="w-8 h-8 rounded-full bg-white text-orange-600 shadow-xs flex items-center justify-center hover:bg-orange-50 transition"
                title="Call Restaurant"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {order.deliveryPartnerName && (
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Delivery Partner</p>
                  <p className="text-xs font-bold text-slate-800">{order.deliveryPartnerName}</p>
                  <p className="text-[11px] text-slate-500">{order.deliveryPartnerPhone || '+91 98765 43210'}</p>
                </div>
                <a
                  href={`tel:${order.deliveryPartnerPhone || '9876543210'}`}
                  className="w-8 h-8 rounded-full bg-orange-500 text-white shadow-xs flex items-center justify-center hover:bg-orange-600 transition"
                  title="Call Driver"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Destination Details */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Destination</p>
            <p className="font-bold text-slate-800">
              {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.zipCode}
            </p>
            {order.deliveryAddress.landmark && (
              <p className="text-slate-500 text-[11px]">Note: {order.deliveryAddress.landmark}</p>
            )}
          </div>

          {/* Ordered Food Items */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Items in Order</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600 font-mono">{item.quantity}x</span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-600">₹{item.subtotal}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs pt-1 font-bold text-slate-900">
                <span>Total Paid ({order.paymentMethod.toUpperCase()})</span>
                <span className="font-mono text-orange-600 font-extrabold">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Cancel Order Action if allowed */}
          {(order.status === 'placed' || order.status === 'confirmed') && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Need to make adjustments?</span>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}

          {/* Review & Rating prompt when delivered */}
          {order.status === 'delivered' && !order.reviewSubmitted && !reviewSuccess && (
            <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                <span>Rate your meal from {order.restaurantName}</span>
              </div>

              {/* Star selector */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= reviewRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">{reviewRating} / 5 Stars</span>
              </div>

              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was the taste, packaging, and temperature?"
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-hidden"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReview ? 'Submitting...' : 'Submit Food Review'}</span>
              </button>
            </form>
          )}

          {(order.reviewSubmitted || reviewSuccess) && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your verified review has been submitted to {order.restaurantName}.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
