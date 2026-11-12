import React, { useState, useEffect } from 'react';
import { Store, Plus, Edit2, Trash2, Check, X, Clock, ChefHat, Bike, DollarSign, PackageCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Restaurant, FoodItem, Order, OrderStatus } from '../types';
import { AddEditFoodModal } from '../components/AddEditFoodModal';

export const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'incoming' | 'menu' | 'completed' | 'settings'>('incoming');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);

  const restaurantId = user?.restaurantId || 'rest_pizza_1';

  const fetchData = () => {
    // 1. Fetch restaurant
    fetch(`/api/restaurants/${restaurantId}`)
      .then((r) => r.json())
      .then((data) => {
        setRestaurant(data.restaurant);
        setFoodItems(data.foodItems || []);
      })
      .catch((e) => console.error(e));

    // 2. Fetch orders
    fetch(`/api/orders?restaurantId=${restaurantId}`)
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
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  // Status progression action
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const res = await fetch(`/api/food-items/${itemId}/availability`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      const res = await fetch(`/api/food-items/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFoodItem = async (itemData: Partial<FoodItem>) => {
    const isEdit = !!itemData.id;
    const url = isEdit ? `/api/food-items/${itemData.id}` : '/api/food-items';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });

    if (res.ok) {
      fetchData();
    }
  };

  const incomingOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  const totalSales = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.subtotal || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-extrabold shadow-md shadow-orange-500/20">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {restaurant?.name || 'Restaurant Kitchen Console'}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                Kitchen Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {restaurant?.address || 'Food District'} · Rating: {restaurant?.rating || '4.9'} ★
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-6 text-left border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Total Kitchen Sales</span>
            <span className="text-xl font-black text-slate-900 font-mono text-emerald-600">
              ₹{totalSales.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Live Orders</span>
            <span className="text-xl font-black text-orange-600 font-mono">
              {incomingOrders.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
              activeTab === 'incoming'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Live Kitchen Orders ({incomingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Manage Menu Dishes ({foodItems.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 ${
              activeTab === 'completed'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Completed Orders ({completedOrders.length})
          </button>
        </div>

        {activeTab === 'menu' && (
          <button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Food Item
          </button>
        )}
      </div>

      {/* 1. Incoming Kitchen Orders */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Kitchen is ready</h3>
              <p className="text-xs text-slate-500">No active incoming orders right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incomingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border-2 border-orange-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{ord.customerName}</h4>
                      <p className="text-xs text-slate-500">{ord.customerPhone}</p>
                    </div>

                    {/* Items checklist */}
                    <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                      {ord.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-mono text-slate-500">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs pt-1">
                      <span className="font-semibold text-slate-600">Current Status:</span>
                      <span className="font-bold text-orange-600 capitalize">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Order Workflow Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {ord.status === 'placed' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'cancelled')}
                          className="py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'confirmed')}
                          className="py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                        >
                          Accept Order
                        </button>
                      </div>
                    )}

                    {ord.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')}
                        className="w-full py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Cooking (Preparing)</span>
                      </button>
                    )}

                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'out_for_delivery')}
                        className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Ready & Hand to Driver</span>
                      </button>
                    )}

                    {ord.status === 'out_for_delivery' && (
                      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 text-xs text-center font-bold">
                        Driver {ord.deliveryPartnerName || 'Assigned'} is delivering
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Menu Management */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((food) => (
              <div
                key={food.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                    <img
                      src={food.image}
                      alt={food.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          food.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                      <h4 className="text-sm font-bold text-slate-900 truncate">{food.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{food.description}</p>
                    <p className="text-sm font-black text-orange-600 font-mono">
                      ₹{food.price}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Availability toggle */}
                  <button
                    onClick={() => handleToggleAvailability(food.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      food.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {food.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(food);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50"
                      title="Edit dish"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(food.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Completed Orders */}
      {activeTab === 'completed' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {completedOrders.length === 0 ? (
            <div className="text-center py-12 p-6 text-slate-500 text-xs">
              No completed orders yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {completedOrders.map((ord) => (
                <div key={ord.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800">#{ord.orderNumber}</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{ord.customerName}</p>
                    <p className="text-slate-400">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 font-mono text-sm block">
                      +₹{ord.subtotal}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Food Modal */}
      <AddEditFoodModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveFoodItem}
        initialItem={editingItem}
        restaurantId={restaurantId}
      />
    </div>
  );
};
