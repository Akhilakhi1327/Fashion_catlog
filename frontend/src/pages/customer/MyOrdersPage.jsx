import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import SEO from '../../components/SEO';
import { FiPackage, FiArrowLeft, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ORDER_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const getStepIndex = (status) => {
  const map = { Pending: 0, Processing: 1, Shipped: 2, Delivered: 3, Cancelled: -1 };
  return map[status] ?? 0;
};

const OrderStatusTracker = ({ status }) => {
  const isCancelled = status === 'Cancelled';
  const currentStep = getStepIndex(status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-xl w-fit">
        ❌ Order Cancelled
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center min-w-[320px]">
        {ORDER_STEPS.map((step, index) => {
          const done = index <= currentStep;
          const active = index === currentStep;
          return (
            <React.Fragment key={step}>
              {/* Step circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    done
                      ? 'bg-green-500 border-green-500 text-white shadow-md'
                      : 'bg-white border-gray-300 text-gray-400'
                  } ${active ? 'ring-2 ring-green-200 scale-110' : ''}`}
                >
                  {done ? '✓' : index + 1}
                </div>
                <span
                  className={`text-[9px] font-bold mt-1 text-center leading-tight ${
                    done ? 'text-green-600' : 'text-gray-400'
                  } ${active ? 'text-green-700' : ''}`}
                >
                  {step}
                </span>
              </div>
              {/* Connector line */}
              {index < ORDER_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const MyOrdersPage = () => {
  const { customerInfo } = useCustomerAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!customerInfo) {
      navigate('/login');
      return;
    }
    const fetchMyOrders = async () => {
      try {
        const res = await api.get('/orders/myorders');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [customerInfo, navigate]);

  if (loading) return <Spinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-10 animate-fade-in">
      <SEO title="My Orders" description="View your IndhuVadhana order history" />

      {/* Header */}
      <div className="bg-primary px-4 pt-10 pb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cream/80 mb-4 text-sm">
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <FiPackage className="w-7 h-7 text-biscuit" />
          <h1 className="text-2xl font-bold text-white font-display">My Orders</h1>
        </div>
        <p className="text-cream/70 text-sm mt-1">{orders.length} orders placed</p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <span className="text-5xl block mb-4">📦</span>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-6">Looks like you haven't made any purchases yet.</p>
            <Link to="/products" className="btn-primary px-8 py-2.5 text-sm">Start Shopping</Link>
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Order Header (always visible) */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-500 truncate">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                        order.status === 'Shipped'   ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      {' · '}
                      <span className="font-bold text-primary">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                  {isExpanded ? <FiChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>

                {/* Expanded Order Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    {/* Visual Status Tracker */}
                    <OrderStatusTracker status={order.status} />

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3">
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-lg bg-white border border-gray-200 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/products/${item.product}`}
                              className="font-bold text-gray-900 hover:text-primary text-sm line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Qty: {item.qty}
                              {item.size && ` · Size: ${item.size}`}
                              {item.color && ` · Color: ${item.color}`}
                            </p>
                            <p className="text-xs font-bold text-primary mt-0.5">₹{item.price?.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Address & Summary */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="font-bold text-gray-500 uppercase tracking-wider mb-1">Deliver To</p>
                        <p className="text-gray-800 font-medium">{order.customerName}</p>
                        <p className="text-gray-500 leading-relaxed mt-0.5">{order.address}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="font-bold text-gray-500 uppercase tracking-wider mb-1">Order Total</p>
                        <p className="text-lg font-bold text-primary">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                        <p className="text-gray-400 mt-0.5">Payment: {order.paymentMethod || 'COD'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
