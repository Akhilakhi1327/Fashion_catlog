import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useToast } from '../context/ToastContext';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import SEO from '../components/SEO';

const CartPage = () => {
  const { cartItems, updateCartQty, removeFromCart, cartTotal } = useCart();
  const { customerInfo, toggleWishlist } = useCustomerAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [savingId, setSavingId] = useState(null);

  const handleSaveForLater = async (item) => {
    if (!customerInfo) {
      toast.error('Please login to save items');
      navigate('/login');
      return;
    }
    setSavingId(`${item.product}-${item.color}-${item.size}`);
    try {
      await toggleWishlist(item.product);
      removeFromCart(item.product, item.color, item.size);
      toast.success(`${item.name} saved to Wishlist`);
    } catch (e) {
      toast.error('Could not save item');
    } finally {
      setSavingId(null);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <SEO title="Cart" description="Your IndhuVadhana shopping cart" />
        <div className="w-28 h-28 bg-cream border border-biscuit rounded-full flex items-center justify-center mb-6">
          <FiShoppingBag className="w-12 h-12 text-primary opacity-60" />
        </div>
        <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary px-8 py-3 text-sm shadow-md">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-28 md:pb-10">
      <SEO title="Cart" description="Your IndhuVadhana shopping cart" />
      <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const itemKey = `${item.product}-${item.color}-${item.size}`;
            const isSaving = savingId === itemKey;
            return (
              <div
                key={itemKey}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 shadow-sm relative"
              >
                {/* Product Image */}
                <Link to={`/products/${item.product}`} className="flex-shrink-0">
                  <img
                    src={getOptimizedImageUrl(item.image, 150) || '/placeholder.png'}
                    alt={item.name}
                    className="w-24 h-28 object-cover rounded-xl bg-gray-50 border border-gray-100"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    to={`/products/${item.product}`}
                    className="font-bold text-gray-900 hover:text-primary transition-colors text-sm sm:text-base line-clamp-2 leading-snug"
                  >
                    {item.name}
                  </Link>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    {item.color && (
                      <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                        Color: {item.color}
                      </span>
                    )}
                    {item.size && (
                      <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                        Size: {item.size}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-primary text-sm sm:text-base">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    {item.qty > 1 && (
                      <span className="text-xs text-gray-400 font-normal ml-1">
                        (₹{item.price.toLocaleString('en-IN')} × {item.qty})
                      </span>
                    )}
                  </div>

                  {/* Qty Stepper + Actions Row */}
                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    {/* Quantity Stepper */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateCartQty(item.product, item.color, item.size, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors"
                      >
                        <FiMinus className="w-3 h-3" />
                      </button>
                      <span className="px-3 font-bold text-sm text-gray-900 border-x border-gray-200">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.product, item.color, item.size, item.qty + 1)}
                        disabled={item.qty >= (item.stock || 99)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors"
                      >
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Save for Later */}
                    <button
                      onClick={() => handleSaveForLater(item)}
                      disabled={isSaving}
                      className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all disabled:opacity-60"
                    >
                      <FiHeart className="w-3 h-3" />
                      <span>{isSaving ? 'Saving...' : 'Save for Later'}</span>
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.product, item.color, item.size)}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary (Sticky on Desktop) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-bold font-display text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm text-gray-600 pb-4 border-b border-gray-100">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((a, c) => a + c.qty, 0)} items)</span>
                <span className="font-semibold text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
            </div>

            <div className="pt-4 mb-5">
              <div className="flex justify-between items-center text-base font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-primary text-lg">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Inclusive of all taxes</p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-all active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <FiArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/products"
              className="block mt-3 text-center text-xs text-gray-400 hover:text-primary font-semibold transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">{cartItems.reduce((a, c) => a + c.qty, 0)} items</p>
            <p className="font-bold text-primary text-sm">₹{cartTotal.toLocaleString('en-IN')}</p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            Proceed to Checkout <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
