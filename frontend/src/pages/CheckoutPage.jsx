import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../services/orderService';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { FiCheckCircle, FiLoader, FiChevronDown, FiChevronUp, FiUser, FiPhone, FiMapPin, FiShoppingBag, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import SEO from '../components/SEO';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const STEPS = [
  { id: 1, label: 'Customer Details', icon: FiUser },
  { id: 2, label: 'Delivery Address', icon: FiMapPin },
  { id: 3, label: 'Review & Place Order', icon: FiShoppingBag },
];

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { customerInfo } = useCustomerAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = useState('919182764294');
  const [redirectSeconds, setRedirectSeconds] = useState(3);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/config');
        if (res.data?.success && res.data.data?.whatsappNumber) {
          setAdminWhatsAppNumber(res.data.data.whatsappNumber);
        }
      } catch (err) { /* silent */ }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) navigate('/cart');
    if (customerInfo) setCustomerName(customerInfo.name);
  }, [cartItems, navigate, customerInfo, orderPlaced]);

  useEffect(() => {
    if (orderPlaced && whatsappLink && redirectSeconds > 0) {
      const timer = setTimeout(() => setRedirectSeconds(p => p - 1), 1000);
      return () => clearTimeout(timer);
    } else if (orderPlaced && whatsappLink && redirectSeconds === 0) {
      window.location.href = whatsappLink;
    }
  }, [orderPlaced, whatsappLink, redirectSeconds]);

  const goToStep = (step) => {
    // Only allow going back to completed steps, or moving forward one step at a time
    if (step < activeStep || completedSteps.has(step - 1)) setActiveStep(step);
  };

  const handleStep1Next = () => {
    if (!customerName.trim()) { toast.error('Please enter your full name'); return; }
    if (!phoneNumber.trim() || !/^[0-9]{10}$/.test(phoneNumber.trim())) { toast.error('Enter a valid 10-digit phone number'); return; }
    setCompletedSteps(p => new Set([...p, 1]));
    setActiveStep(2);
  };

  const handleStep2Next = () => {
    if (!shippingAddress.trim() || shippingAddress.trim().length < 10) { toast.error('Please enter your complete delivery address'); return; }
    setCompletedSteps(p => new Set([...p, 2]));
    setActiveStep(3);
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    try {
      const orderItems = cartItems.map(item => ({
        product: item.product, name: item.name, qty: item.qty,
        price: item.price, color: item.color, size: item.size,
      }));
      const res = await createOrder({ customerName, phone: phoneNumber, address: shippingAddress, orderItems });

      if (res.success) {
        setOrderPlaced(true);
        setOrderId(res.data._id);
        clearCart();
        toast.success('Order placed successfully!');

        const itemsList = cartItems.map(item => {
          let line = `• ${item.name} (Qty: ${item.qty}) - ₹${(item.price * item.qty).toLocaleString('en-IN')}`;
          if (item.color) line += ` | Color: ${item.color}`;
          if (item.size) line += ` | Size: ${item.size}`;
          return line;
        }).join('\n');

        const text = `Hi IndhuVadhana, New Order Received\n\n*Customer Name:* ${customerName.trim()}\n*Customer Phone:* +91${phoneNumber.trim()}\n\n*Order Items:*\n${itemsList}\n\n*Total Amount:* ₹${cartTotal.toLocaleString('en-IN')}\n*Delivery Address:* ${shippingAddress.trim()}\n\n*Order ID:* ${res.data._id}`;
        setWhatsappLink(`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(text)}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-fade-in pb-24">
        <SEO title="Order Placed" description="Your IndhuVadhana order was placed successfully" />
        <div className="bg-white rounded-3xl border shadow-lg p-8 sm:p-10">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-400 text-sm mb-3">Thank you! Your order has been received.</p>
          <p className="text-xs font-mono bg-gray-100 py-2 px-4 rounded-lg inline-block mb-6 text-gray-600">
            Order ID: {orderId}
          </p>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm font-bold text-green-800 mb-1">📲 One Last Step!</p>
            <p className="text-xs text-green-700 mb-3 leading-relaxed">
              {redirectSeconds > 0
                ? <span>Redirecting to WhatsApp in <strong>{redirectSeconds}s</strong> to send order details...</span>
                : <span>Click below to send your order details on WhatsApp.</span>}
            </p>
            <a
              href={whatsappLink}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              📱 Send on WhatsApp
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/products')} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl text-sm shadow-md">Continue Shopping</button>
            <button onClick={() => navigate('/my-orders')} className="flex-1 border-2 border-primary text-primary font-bold py-3 rounded-xl text-sm">View My Orders</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24">
      <SEO title="Checkout" description="Complete your IndhuVadhana order" />
      <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 mb-2">Checkout</h1>
      <p className="text-xs text-gray-400 mb-6">Complete the steps below to place your order</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Accordion Steps */}
        <div className="lg:col-span-7 space-y-3">
          {!customerInfo && (
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-2xl text-sm">
              Want to track your order?{' '}
              <button onClick={() => navigate('/login')} className="font-bold underline">Login</button>{' '}or{' '}
              <button onClick={() => navigate('/register')} className="font-bold underline">Register</button> first.
            </div>
          )}

          {STEPS.map((step) => {
            const StepIcon = step.icon;
            const isDone = completedSteps.has(step.id);
            const isActive = activeStep === step.id;

            return (
              <div key={step.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${isActive ? 'border-primary' : isDone ? 'border-green-300' : 'border-gray-200'}`}>
                {/* Step Header */}
                <button
                  onClick={() => goToStep(step.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${isActive ? 'bg-cream' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isDone ? 'bg-green-500 border-green-500 text-white' :
                      isActive ? 'bg-primary border-primary text-white' :
                      'border-gray-300 text-gray-400'
                    }`}>
                      {isDone ? <FiCheck className="w-4 h-4" /> : step.id}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-primary' : isDone ? 'text-green-700' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {/* Summary hint when collapsed */}
                      {isDone && !isActive && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {step.id === 1 && `${customerName} · +91${phoneNumber}`}
                          {step.id === 2 && shippingAddress.substring(0, 50) + '...'}
                        </p>
                      )}
                    </div>
                  </div>
                  {isActive ? <FiChevronUp className="w-4 h-4 text-primary" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {/* Step Content */}
                {isActive && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {/* Step 1: Customer Details */}
                    {step.id === 1 && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                          <input
                            type="text" required value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Priya Sharma"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number *</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">+91</span>
                            <input
                              type="tel" required value={phoneNumber} pattern="[0-9]{10}"
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="9876543210"
                              className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                        <button onClick={handleStep1Next} className="w-full bg-primary text-white font-bold py-3 rounded-xl text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95">
                          Continue to Address →
                        </button>
                      </>
                    )}

                    {/* Step 2: Delivery Address */}
                    {step.id === 2 && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Complete Delivery Address *</label>
                          <textarea
                            required rows={4} value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="House No, Street, Landmark, City, State, Pincode"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <button onClick={handleStep2Next} className="w-full bg-primary text-white font-bold py-3 rounded-xl text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95">
                          Review Your Order →
                        </button>
                      </>
                    )}

                    {/* Step 3: Review & Place Order */}
                    {step.id === 3 && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 font-semibold">Name</span>
                            <span className="font-bold text-gray-800">{customerName}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 font-semibold">Phone</span>
                            <span className="font-bold text-gray-800">+91 {phoneNumber}</span>
                          </div>
                          <div className="flex items-start justify-between text-xs gap-4">
                            <span className="text-gray-500 font-semibold flex-shrink-0">Address</span>
                            <span className="font-bold text-gray-800 text-right leading-relaxed">{shippingAddress}</span>
                          </div>
                        </div>
                        <hr className="border-gray-100" />
                        <div className="space-y-2">
                          {cartItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                              <img src={getOptimizedImageUrl(item.image, 80) || '/placeholder.png'} alt={item.name} className="w-11 h-11 object-cover rounded-lg border border-gray-200 bg-white flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                <p className="text-[10px] text-gray-400">Qty: {item.qty}{item.size && ` · ${item.size}`}{item.color && ` · ${item.color}`}</p>
                              </div>
                              <p className="text-xs font-bold text-primary flex-shrink-0">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-cream border border-biscuit rounded-xl px-4 py-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-700">Total Amount</span>
                          <span className="text-lg font-bold text-primary">₹{cartTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center">Payment: Cash on Delivery (COD)</p>
                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70"
                        >
                          {loading ? <FiLoader className="animate-spin w-5 h-5" /> : <span>✓ Place Order — ₹{cartTotal.toLocaleString('en-IN')}</span>}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary (Sticky) */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-4 font-display">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img src={getOptimizedImageUrl(item.image, 80) || '/placeholder.png'} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-gray-100 bg-gray-50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty {item.qty}{item.size && ` · ${item.size}`}{item.color && ` · ${item.color}`}</p>
                    <p className="text-xs font-bold text-primary mt-0.5">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-primary">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-4">COD · Free Delivery · Secure Order</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
