import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Store,
  Bike,
  Package,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { User, Restaurant, DeliveryPartner, Order, Complaint } from '../types';

Chart.register(...registerables);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRestaurants: 0,
    totalDeliveryPartners: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOrdersCount: 0,
    orderStatusCounts: {} as Record<string, number>,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'restaurants' | 'complaints'>('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const revenueChartRef = useRef<HTMLCanvasElement | null>(null);
  const statusChartRef = useRef<HTMLCanvasElement | null>(null);
  const revenueChartInstance = useRef<Chart | null>(null);
  const statusChartInstance = useRef<Chart | null>(null);

  const fetchAdminData = () => {
    // 1. Fetch stats
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch((e) => console.error(e));

    // 2. Fetch orders
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((e) => console.error(e));

    // 3. Fetch users
    fetch('/api/auth/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch((e) => console.error(e));

    // 4. Fetch restaurants
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((data) => setRestaurants(data.restaurants || []))
      .catch((e) => console.error(e));

    // 5. Fetch delivery partners
    fetch('/api/delivery/partners')
      .then((r) => r.json())
      .then((data) => setPartners(data.partners || []))
      .catch((e) => console.error(e));

    // 6. Fetch complaints
    fetch('/api/admin/complaints')
      .then((r) => r.json())
      .then((data) => setComplaints(data.complaints || []))
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Initialize and update Chart.js when in 'overview' tab
  useEffect(() => {
    if (activeTab !== 'overview') return;

    // Destroy existing charts if any
    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
    }
    if (statusChartInstance.current) {
      statusChartInstance.current.destroy();
    }

    // 1. Weekly Revenue Trend Bar/Line Chart
    if (revenueChartRef.current) {
      revenueChartInstance.current = new Chart(revenueChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Gross Sales (₹)',
              data: [18500, 24200, 19800, 31000, 42500, 58200, Math.max(35000, stats.totalRevenue)],
              backgroundColor: 'rgba(234, 88, 12, 0.85)',
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
            },
            x: {
              grid: { display: false },
            },
          },
        },
      });
    }

    // 2. Order Status Doughnut Chart
    if (statusChartRef.current) {
      const counts = stats.orderStatusCounts || {};
      statusChartInstance.current = new Chart(statusChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Delivered', 'Preparing', 'Out for Delivery', 'Confirmed', 'Placed'],
          datasets: [
            {
              data: [
                counts.delivered || 1,
                counts.preparing || 1,
                counts.out_for_delivery || 1,
                counts.confirmed || 0,
                counts.placed || 0,
              ],
              backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ea580c'],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          },
        },
      });
    }

    return () => {
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      if (statusChartInstance.current) statusChartInstance.current.destroy();
    };
  }, [activeTab, stats]);

  // Actions
  const handleToggleUserStatus = async (userId: string, current: string) => {
    const nextStatus = current === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRestaurantApproval = async (restId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/restaurants/${restId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !current }),
      });
      if (res.ok) {
        setRestaurants(restaurants.map((r) => (r.id === restId ? { ...r, isApproved: !current } : r)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const res = await fetch(`/api/admin/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          resolutionNotes: 'Reviewed and resolved by Platform Supervisor.',
        }),
      });
      if (res.ok) {
        setComplaints(complaints.map((c) => (c.id === complaintId ? { ...c, status: 'resolved' } : c)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.restaurantName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-purple-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Administrator Operations Console
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live platform monitoring, user management, order auditing, and revenue analytics.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% this week
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <Package className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{stats.totalOrders}</p>
          <p className="text-[10px] text-slate-500">{stats.activeOrdersCount} in progress now</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Customers</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{stats.totalCustomers || 4}</p>
          <p className="text-[10px] text-slate-500">Active Diners</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Restaurants</span>
            <Store className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{stats.totalRestaurants || 4}</p>
          <p className="text-[10px] text-emerald-600 font-bold">100% Verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivery Fleet</span>
            <Bike className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{partners.length || 2}</p>
          <p className="text-[10px] text-slate-500">Active Riders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Analytics & Charts
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Orders Monitor ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 whitespace-nowrap ${
            activeTab === 'restaurants'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Restaurants ({restaurants.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Users & Fleet ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`text-sm font-bold pb-2 transition border-b-2 -mb-2.5 whitespace-nowrap ${
            activeTab === 'complaints'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Complaints & Feedback ({complaints.length})
        </button>
      </div>

      {/* 1. Analytics & Charts Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Weekly Sales & Revenue Trend</h3>
                <p className="text-xs text-slate-500">Simulated real-time gross transaction volume</p>
              </div>
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                Chart.js
              </span>
            </div>
            <div className="h-72 w-full">
              <canvas ref={revenueChartRef} />
            </div>
          </div>

          {/* Status Breakdown Doughnut Chart */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Order Status Distribution</h3>
              <p className="text-xs text-slate-500">Live operational throughput breakdown</p>
            </div>
            <div className="h-72 w-full flex items-center justify-center">
              <canvas ref={statusChartRef} />
            </div>
          </div>
        </div>
      )}

      {/* 2. Orders Monitor Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order #, customer, restaurant..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-purple-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Restaurant</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="p-3 font-medium text-slate-800">{ord.customerName}</td>
                    <td className="p-3 text-slate-600">{ord.restaurantName}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ord.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{ord.deliveryPartnerName || 'Unassigned'}</td>
                    <td className="p-3 text-slate-400">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Restaurants Management Tab */}
      {activeTab === 'restaurants' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Restaurant</th>
                  <th className="p-3">Cuisine</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Delivery Fee</th>
                  <th className="p-3">Approval Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {restaurants.map((rest) => (
                  <tr key={rest.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{rest.name}</p>
                      <p className="text-[11px] text-slate-400">{rest.address}</p>
                    </td>
                    <td className="p-3 text-slate-600">{rest.cuisine.join(', ')}</td>
                    <td className="p-3 font-bold text-amber-500">★ {rest.rating} ({rest.reviewCount})</td>
                    <td className="p-3 font-mono">₹{rest.deliveryFee}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          rest.isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rest.isApproved ? 'Verified Partner' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleRestaurantApproval(rest.id, rest.isApproved)}
                        className="px-3 py-1 rounded-lg border border-slate-200 font-bold hover:bg-slate-50"
                      >
                        {rest.isApproved ? 'Revoke Approval' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Users Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 font-bold capitalize text-slate-700">{u.role}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            u.status === 'active'
                              ? 'text-red-600 hover:bg-red-50 border border-red-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Complaints & Feedback Tab */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-xs text-slate-500">
              No open customer complaints or tickets.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((cmp) => (
                <div
                  key={cmp.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {cmp.userRole} Ticket
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          cmp.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {cmp.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{cmp.subject}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{cmp.message}</p>
                    <p className="text-[11px] text-slate-400">
                      By: {cmp.userName} ({cmp.userEmail}) · {new Date(cmp.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {cmp.status !== 'resolved' ? (
                      <button
                        onClick={() => handleResolveComplaint(cmp.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve Ticket</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Resolved by Support
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
