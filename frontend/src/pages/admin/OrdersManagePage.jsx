import React, { useEffect, useState } from 'react';
import { FiSearch, FiShoppingBag, FiDownload } from 'react-icons/fi';
import { getOrders, updateOrderStatus, deleteOrder } from '../../services/orderService';
import api from '../../services/api';
import OrderTable from '../../components/admin/OrderTable';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';

const OrdersManagePage = () => {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter, search & pagination states
  const [filterStatus, setFilterStatus] = useState('All'); // All, Pending, Confirmed, Shipped, Delivered, Cancelled
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    All: 0, Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0, Cancelled: 0
  });

  const fetchOrdersList = async () => {
    setLoading(true);
    try {
      const res = await getOrders({
        page,
        limit: 10,
        status: filterStatus,
        search: search.trim()
      });
      if (res.success) {
        setOrders(res.data);
        setTotalPages(res.pagination?.pages || 1);
        setTotalOrders(res.pagination?.total || 0);
        if (res.statusCounts) {
          setStatusCounts(res.statusCounts);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, [page, filterStatus]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchOrdersList();
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        // Refresh local orders list
        fetchOrdersList();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        const res = await deleteOrder(orderId);
        if (res.success) {
          toast.success('Order deleted successfully');
          fetchOrdersList();
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        toast.error(err.response?.data?.message || 'Failed to delete order');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/orders/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Orders exported successfully');
    } catch (err) {
      toast.error('Failed to export orders');
      console.error(err);
    }
  };

  const orderStatuses = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  const getCountByStatus = (status) => {
    return statusCounts[status] || 0;
  };

  // Reset page when switching status tab filters
  const handleStatusChange = (status) => {
    setFilterStatus(status);
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Manage Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Process customer buying requests and manage logistics pipeline</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
        >
          <FiDownload />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white border p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by customer name, phone, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4 py-2"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
        </form>

        {/* Tab filters list */}
        <div className="flex bg-gray-100 p-1 rounded-xl border overflow-x-auto w-full sm:w-auto space-x-1 scrollbar-hide text-xs font-bold uppercase tracking-wider">
          {orderStatuses.map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>{st}</span>
              <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">
                {getCountByStatus(st)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main orders table */}
      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl">
          <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No orders match selected status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <OrderTable
            orders={orders}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDeleteOrder}
            loading={false}
          />
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm border mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-semibold">{page}</span> of{' '}
                    <span className="font-semibold">{totalPages}</span> ({totalOrders} total orders)
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        aria-current={page === i + 1 ? 'page' : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                          page === i + 1
                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersManagePage;
