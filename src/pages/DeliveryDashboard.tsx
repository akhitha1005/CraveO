import React, { useState, useEffect } from 'react';
import { Bike, MapPin, Phone, CheckCircle2, Navigation, Package, DollarSign, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order, DeliveryPartner } from '../types';

export const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'assigned' | 'history'>('assigned');
  const [loading, setLoading] = useState(true);

  const fetchDeliveryData = () => {
    // 1. Fetch partners
    fetch('/api/delivery/partners')
      .then((r) => r.json())
      .then((data) => {
        const found = (data.partners || []).find((p: DeliveryPartner) => p.userId === user?.id) || data.partners[0];
        setPartner(found);
      })
      .catch((e) => console.error(e));

    // 2. Fetch all active orders
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeliveryData();
    const interval = setInterval(fetchDeliveryData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const toggleActiveStatus = async () => {
    if (!partner) return;
    const nextStatus = partner.activeStatus === 'available' ? 'offline' : 'available';
    try {
      const res = await fetch(`/api/delivery/partners/${partner.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeStatus: nextStatus }),
      });
      if (res.ok) {
        setPartner({ ...partner, activeStatus: nextStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchDeliveryData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptDelivery = async (orderId: string) => {
    if (!partner) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/assign-delivery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPartnerId: partner.id }),
      });
      if (res.ok) {
        fetchDeliveryData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Assigned or ready for pickup orders
  const activeDeliveries = orders.filter(
    (o) =>
      (o.deliveryPartnerId === partner?.id && o.status !== 'delivered' && o.status !== 'cancelled') ||
      (o.status === 'out_for_delivery' && (!o.deliveryPartnerId || o.deliveryPartnerId === partner?.id))
  );

  const availableToAccept = orders.filter(
    (o) => (o.status === 'preparing' || o.status === 'confirmed') && !o.deliveryPartnerId
  );

  const completedDeliveries = orders.filter(
    (o) => o.status === 'delivered' && (o.deliveryPartnerId === partner?.id || !o.deliveryPartnerId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-blue-500/20">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {partner?.name || user?.name || 'Rider Console'}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {partner?.vehicleType || 'Bike'} ({partner?.vehiclePlate || 'CRV-709'})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rating: {partner?.rating || '4.9'} ★ · Total Trips: {partner?.totalDeliveries || 428}
            </p>
          </div>
        </div>

        {/* Status Toggle & Earnings */}
        <div className="flex items-center gap-6">
          <div className="text-left">
            <span className="text-[11px] font-semibold text-slate-400 block">Total Earnings</span>
            <span className="text-xl font-black text-emerald-600 font-mono">
              ₹{(partner?.totalEarnings || 4850).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={toggleActiveStatus}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${
              partner?.activeStatus === 'available'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                partner?.activeStatus === 'available' ? 'bg-emerald-300 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span>{partner?.activeStatus === 'available' ? 'Online · Ready' : 'Offline'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
            activeTab === 'assigned'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Active Deliveries ({activeDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Delivery History ({completedDeliveries.length})
        </button>
      </div>

      {activeTab === 'assigned' && (
        <div className="space-y-6">
          {/* Active Assigned Deliveries */}
          {activeDeliveries.length === 0 && availableToAccept.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No active delivery jobs</h3>
              <p className="text-xs text-slate-500">
                You will be automatically pinged when a restaurant finishes cooking.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeDeliveries.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border-2 border-blue-300 p-6 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-600 font-mono">
                      Earn: +₹{ord.deliveryFee + (ord.tip || 0)}
                    </span>
                  </div>

                  {/* Route Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Restaurant */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          1. Pick Up Food
                        </span>
                        <a
                          href={`tel:${ord.restaurantPhone || '+91 98490 23456'}`}
                          className="text-orange-600 font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call Kitchen
                        </a>
                      </div>
                      <p className="font-extrabold text-slate-900">{ord.restaurantName}</p>
                      <p className="text-slate-500">{ord.restaurantAddress || 'Road No. 36, Jubilee Hills, Hyderabad'}</p>
                    </div>

                    {/* Dropoff Customer */}
                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          2. Deliver To Customer
                        </span>
                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="text-emerald-700 font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call Diner
                        </a>
                      </div>
                      <p className="font-extrabold text-slate-900">{ord.customerName}</p>
                      <p className="text-slate-600">
                        {ord.deliveryAddress.street}, {ord.deliveryAddress.city}
                      </p>
                      {ord.deliveryAddress.landmark && (
                        <p className="text-slate-500 text-[11px]">Note: {ord.deliveryAddress.landmark}</p>
                      )}
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="font-bold text-slate-800">Order contents:</span>
                    <span>{ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</span>
                  </div>

                  {/* Driver action buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    {ord.status !== 'out_for_delivery' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'out_for_delivery')}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Package className="w-4 h-4" />
                        <span>Picked Up from Kitchen</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Delivered to Doorstep</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Available delivery requests to accept */}
              {availableToAccept.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-bold text-slate-800">
                    Nearby Deliveries Available to Accept ({availableToAccept.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableToAccept.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono font-bold text-slate-700">#{ord.orderNumber}</span>
                          <span className="font-mono font-bold text-emerald-600">
                            +₹{ord.deliveryFee + (ord.tip || 0)}
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-slate-900">{ord.restaurantName}</p>
                          <p className="text-slate-500">To: {ord.deliveryAddress.street}</p>
                        </div>
                        <button
                          onClick={() => handleAcceptDelivery(ord.id)}
                          className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          Accept Delivery Request
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {completedDeliveries.map((ord) => (
              <div key={ord.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-800">#{ord.orderNumber}</span>
                  <p className="font-bold text-slate-900 mt-0.5">{ord.customerName}</p>
                  <p className="text-slate-500">{ord.restaurantName} → {ord.deliveryAddress.street}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 font-mono text-sm block">
                    +₹{ord.deliveryFee + (ord.tip || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
