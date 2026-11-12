import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle2, ChevronRight, RotateCcw, AlertTriangle, Plus, Trash2, Home, Building2, User, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order, DeliveryAddress } from '../types';
import { OrderTrackingModal } from '../components/OrderTrackingModal';

interface CustomerDashboardProps {
  onNavigateToRestaurants: () => void;
  onSelectRestaurant: (id: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigateToRestaurants,
  onSelectRestaurant,
}) => {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [loading, setLoading] = useState(true);

  // Address state
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([
    {
      id: 'addr_1',
      label: 'Home',
      street: 'Flat 402, Sai Residency, Road No. 12, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500034',
      landmark: 'Near Care Hospital',
      isDefault: true,
    },
    {
      id: 'addr_2',
      label: 'Work',
      street: 'Tower B, Cyber Gateway, Hitech City, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500081',
      isDefault: false,
    },
  ]);

  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newZip, setNewZip] = useState('');
  const [newLabel, setNewLabel] = useState('Home');
  const [showAddAddress, setShowAddAddress] = useState(false);

  const fetchOrders = () => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        // Show orders for this customer (or all customer orders in demo)
        const all: Order[] = data.orders || [];
        const userOrders = all.filter(
          (o) => o.customerId === user?.id || user?.role === 'customer'
        );
        setOrders(userOrders.length ? userOrders : all.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, [user]);

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newZip) return;
    const newAddr: DeliveryAddress = {
      id: `addr_${Date.now()}`,
      label: newLabel,
      street: newStreet,
      city: newCity,
      state: 'CA',
      zipCode: newZip,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, newAddr]);
    setNewStreet('');
    setNewCity('');
    setNewZip('');
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleReorder = (order: Order) => {
    alert(`Reorder placed into your active cart from ${order.restaurantName}!`);
    onSelectRestaurant(order.restaurantId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Dashboard Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-xl shadow-xs">
            {user?.name.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Customer Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email} · {user?.phone || '+91 98490 23456'}</p>
          </div>
        </div>

        <button
          onClick={onNavigateToRestaurants}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          Explore Restaurants & Order
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
            activeTab === 'orders'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          My Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
            activeTab === 'addresses'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Saved Delivery Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
            activeTab === 'profile'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Profile & Preferences
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-8">
          {/* Active / In-progress Orders */}
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900">Live Active Orders ({activeOrders.length})</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl bg-white border-2 border-orange-200 shadow-sm space-y-4 hover:border-orange-400 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">
                          #{ord.orderNumber}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-1">{ord.restaurantName}</h4>
                      </div>
                      <span className="text-xs font-bold text-orange-600 capitalize bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 border-t border-b border-slate-100 py-2">
                      {ord.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-mono">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Amount</span>
                        <span className="text-sm font-black text-slate-900 font-mono">
                          ₹{ord.totalAmount}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedOrderForTracking(ord)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <span>Live Track Order</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Orders History */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Order History ({pastOrders.length})</h3>

            {pastOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No past orders yet. Try placing your first meal!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
                {pastOrders.map((ord) => (
                  <div key={ord.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-700">#{ord.orderNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {ord.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">· {new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{ord.restaurantName}</h4>
                      <p className="text-xs text-slate-500">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right pr-2">
                        <span className="text-sm font-black font-mono text-slate-900 block">
                          ₹{ord.totalAmount}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">{ord.paymentMethod}</span>
                      </div>

                      <button
                        onClick={() => setSelectedOrderForTracking(ord)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleReorder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Saved Delivery Addresses</h3>
              <p className="text-xs text-slate-500">Manage drop-off locations for home, work, or friends.</p>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-5 bg-white rounded-2xl border border-orange-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800">New Address Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Label</label>
                  <select
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="e.g. 500 Market Street, Apt 12"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    placeholder="90210"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {addr.label === 'Work' ? <Building2 className="w-4 h-4 text-orange-500" /> : <Home className="w-4 h-4 text-orange-500" />}
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2 font-medium">{addr.street}</p>
                  <p className="text-xs text-slate-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="text-orange-600 hover:text-orange-700 font-bold"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-slate-400">Primary delivery spot</span>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-slate-400 hover:text-red-500"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Phone</label>
              <input
                type="tel"
                disabled
                value={user?.phone || '+91 98490 23456'}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2">
            Dietary preference: Contactless doorstep drop-off enabled by default.
          </p>
        </div>
      )}

      {/* Tracking Modal */}
      {selectedOrderForTracking && (
        <OrderTrackingModal
          order={selectedOrderForTracking}
          isOpen={!!selectedOrderForTracking}
          onClose={() => setSelectedOrderForTracking(null)}
          onOrderUpdated={(updated) => {
            setSelectedOrderForTracking(updated);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};
