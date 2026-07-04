import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHome } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const SubpageNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  // Determine dynamic title for subpages
  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/products/')) return 'Product Details';
    if (pathname.startsWith('/products')) return 'Shop All';
    if (pathname.startsWith('/cart')) return 'Shopping Cart';
    if (pathname.startsWith('/account')) return 'My Account';
    if (pathname.startsWith('/my-orders')) return 'My Orders';
    if (pathname.startsWith('/wishlist')) return 'My Wishlist';
    if (pathname.startsWith('/help')) return 'Help Center';
    if (pathname.startsWith('/checkout')) return 'Checkout';
    if (pathname.startsWith('/categories')) return 'Categories';
    if (pathname.startsWith('/login')) return 'Login';
    if (pathname.startsWith('/register')) return 'Register';
    if (pathname.startsWith('/verify-otp')) return 'Verify Email';
    if (pathname.startsWith('/forgot-password')) return 'Forgot Password';
    return 'IndhuVadhana';
  };

  const title = getPageTitle(location.pathname);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-700 hover:text-primary transition-colors py-1.5 px-3 rounded-xl hover:bg-gray-50 active:scale-95 duration-200"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">Back</span>
        </button>

        {/* Center: Dynamic Title */}
        <div className="text-center">
          <span className="text-base sm:text-lg font-bold font-display text-gray-900 tracking-tight">
            {title}
          </span>
        </div>

        {/* Right: Cart & Home Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="p-2 text-gray-700 hover:text-primary transition-colors rounded-full hover:bg-gray-50 active:scale-95 duration-200"
            title="Go to Home"
          >
            <FiHome className="w-5 h-5" />
          </Link>
          <Link
            to="/cart"
            className="relative p-2 text-gray-700 hover:text-primary transition-colors rounded-full hover:bg-gray-50 active:scale-95 duration-200"
            title="Shopping Cart"
          >
            <FiShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[1.15rem] h-4 rounded-full bg-primary px-1 text-[9px] font-bold text-white grid place-items-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default SubpageNavbar;
