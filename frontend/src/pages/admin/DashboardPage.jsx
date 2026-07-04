import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBox,
  FiShoppingBag,
  FiGrid,
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowRight,
  FiPlus,
} from 'react-icons/fi';
import api from '../../services/api';
import StatsCard from '../../components/admin/StatsCard';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return <Spinner />;

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">Failed to load system dashboard telemetry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">System Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Realtime catalog and order monitoring telemetry</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/products/add"
            className="btn-primary flex items-center space-x-1.5 px-4 py-2.5 text-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>Publish Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={FiBox}
          color="indigo"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={FiShoppingBag}
          color="primary"
        />
        <StatsCard
          title="Categories"
          value={stats.totalCategories}
          icon={FiGrid}
          color="amber"
        />
        <StatsCard
          title="Out Of Stock"
          value={stats.outOfStock}
          icon={FiAlertTriangle}
          color="rose"
        />
        <StatsCard
          title="Low Stock Warning"
          value={stats.lowStock}
          icon={FiAlertTriangle}
          color="amber"
        />
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent orders */}
        <div className="lg:col-span-8 bg-white border rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-gray-900">Recent Customer Requests</h3>
            <Link
              to="/admin/orders"
              className="flex items-center space-x-1 text-xs font-bold text-primary-600 hover:text-primary-850"
            >
              <span>View All</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400 pb-3 text-left">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {stats.recentOrders?.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50/30 transition-all">
                    <td className="py-3.5">
                      <p className="font-bold text-gray-900">{ord.customerName}</p>
                      <p className="text-xs text-gray-400">{ord.phone}</p>
                    </td>
                    <td className="py-3.5 truncate max-w-[200px]" title={ord.orderItems?.[0]?.name}>
                      {ord.orderItems?.length > 0 ? (
                        <>
                          <span className="font-medium text-gray-800">{ord.orderItems[0].name}</span>
                          {ord.orderItems.length > 1 && <span className="text-xs text-indigo-500 ml-1">+{ord.orderItems.length - 1} more</span>}
                        </>
                      ) : (
                        <span className="text-red-500 font-semibold">Unknown Items</span>
                      )}
                    </td>
                    <td className="py-3.5 text-center font-bold">
                      {ord.orderItems?.reduce((sum, item) => sum + item.qty, 0) || 0}
                    </td>
                    <td className="py-3.5 text-right">
                      <Badge status={ord.status} />
                    </td>
                  </tr>
                ))}
                {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-xs text-gray-400">
                      No order records found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories / Quick action summary card */}
        <div className="lg:col-span-4 bg-white border rounded-2xl shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold font-display text-gray-900">Direct Actions</h3>
          
          <div className="space-y-3.5">
            <Link
              to="/admin/products"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 border rounded-xl transition-all group"
            >
              <div className="flex items-center space-x-3">
                <FiBox className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-gray-800">Inventory Catalog</span>
              </div>
              <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/admin/inventory"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 border rounded-xl transition-all group"
            >
              <div className="flex items-center space-x-3">
                <FiAlertTriangle className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-gray-800">Quick Stock Replenish</span>
              </div>
              <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 border rounded-xl transition-all group"
            >
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-gray-800">Process Pending Orders</span>
              </div>
              <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
