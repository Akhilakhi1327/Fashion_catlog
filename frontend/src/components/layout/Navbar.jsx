import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiUser, FiShoppingCart, FiChevronDown, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { admin } = useAuth();
  const { customerInfo, logout } = useCustomerAuth();
  const { cartItems } = useCart();
  const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const categories = ['Sarees', 'Kurtis', 'Dresses', 'Lehengas', 'Suits', 'Tops', 'Bottoms', 'Accessories'];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(74,44,34,0.08)] py-2 border-b border-gray-100' 
            : 'bg-white/90 backdrop-blur-md py-3 border-b border-gray-100'
        }`}
      >
        <div className="section-shell px-4">
          {/* Mobile View: Two Row Layout */}
          <div className="flex flex-col md:hidden gap-3">
            {/* Row 1: Logo & Icons */}
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                <button
                  onClick={() => setIsLogoModalOpen(true)}
                  className="flex items-center focus:outline-none transform active:scale-95 transition-transform"
                  title="View Logo"
                >
                  <img
                    src="/logo.png"
                    alt="House Of Induva Logo"
                    className="h-11 object-contain drop-shadow-sm"
                  />
                </button>
              </div>

              {/* Wishlist, Cart & Admin (if logged in) */}
              <div className="flex items-center gap-3 text-brandText">
                {admin && (
                  <Link 
                    to="/admin/dashboard" 
                    className="rounded-full border border-[#ead9c5] bg-white/90 px-3 py-1 text-[10px] font-bold text-primary shadow-sm hover:border-biscuit transition-all"
                  >
                    Admin
                  </Link>
                )}
                <Link 
                  to="/wishlist" 
                  className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 active:scale-90 transition-transform" 
                  aria-label="Wishlist"
                >
                  <FiHeart className="w-4.5 h-4.5" />
                </Link>
                <Link 
                  to="/cart" 
                  className="relative grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 active:scale-90 transition-transform" 
                  aria-label="Cart"
                >
                  <FiShoppingCart className="w-4.5 h-4.5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-4 rounded-full bg-primary px-1 text-[9px] font-bold text-white grid place-items-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Row 2: Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search sarees, kurtis, dresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 pl-10 text-xs text-brandText shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              {searchQuery.trim() && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white shadow-sm"
                >
                  Search
                </button>
              )}
            </form>
          </div>

          {/* Desktop View: Single Row Layout */}
          <div className="hidden md:flex items-center justify-between gap-3 h-16 md:h-[4.75rem]">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => setIsLogoModalOpen(true)}
                className="flex items-center gap-3 focus:outline-none transform active:scale-95 transition-transform"
                title="View Logo"
              >
                <img
                  src="/logo.png"
                  alt="House Of Induva Logo"
                  className="h-14 md:h-16 object-contain drop-shadow-sm"
                />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center gap-7 text-sm font-semibold text-brandText">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/products" className="hover:text-primary transition-colors">Shop All</Link>
              <div className="relative group py-2">
                <button className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none">
                  <span>Categories</span>
                  <FiChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-52 rounded-2xl glass-card py-2 hidden group-hover:block animate-fade-in overflow-hidden">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/products?category=${cat}`}
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#faf2e8] hover:text-primary transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-1 max-w-md">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search sarees, kurtis, dresses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-[#ead9c5] bg-white/90 px-5 py-3 pl-12 text-sm text-brandText shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-biscuit"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90"
                  aria-label="Search Submit"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="flex items-center gap-3 lg:gap-5 text-brandText">
              <Link to="/wishlist" className="relative grid h-11 w-11 place-items-center rounded-full border border-[#ead9c5] bg-white/90 shadow-sm hover:border-biscuit hover:text-primary transition-all" aria-label="Wishlist">
                <FiHeart className="w-5 h-5" />
              </Link>

              <Link to="/cart" className="relative grid h-11 w-11 place-items-center rounded-full border border-[#ead9c5] bg-white/90 shadow-sm hover:border-biscuit hover:text-primary transition-all" aria-label="Cart">
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 rounded-full bg-[#4b2c24] px-1 text-[10px] font-bold text-white grid place-items-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>

              {customerInfo ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 rounded-full border border-[#ead9c5] bg-white/90 px-3 py-2 text-sm font-semibold shadow-sm hover:border-biscuit transition-all focus:outline-none">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f3e1d0] text-primary">
                      <FiUser className="w-4 h-4" />
                    </span>
                    <span className="hidden lg:inline">{customerInfo.name.split(' ')[0]}</span>
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl glass-card hidden group-hover:block animate-fade-in">
                    <Link to="/account" className="block px-4 py-3 text-sm hover:bg-[#faf2e8]">My Profile</Link>
                    <Link to="/my-orders" className="block px-4 py-3 text-sm hover:bg-[#faf2e8]">Orders</Link>
                    <button onClick={logout} className="w-full border-t border-white/70 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-all">
                  Login
                </Link>
              )}

              {admin && (
                <Link to="/admin/dashboard" className="rounded-full border border-[#ead9c5] bg-white/90 px-4 py-2.5 text-xs font-bold text-primary shadow-sm hover:border-biscuit transition-all">
                  Admin Control
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>


      {/* Full-Screen Logo Modal */}
      {isLogoModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsLogoModalOpen(false)}
        >
          <button
            onClick={() => setIsLogoModalOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-biscuit p-2 focus:outline-none transition-colors"
            aria-label="Close Preview"
          >
            <FiX className="w-8 h-8" />
          </button>
          <div
            className="relative max-w-full max-h-[80vh] flex flex-col items-center justify-center p-6 bg-[#1f120f] rounded-3xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/logo.png"
              alt="House Of Induva Golden Logo"
              className="max-w-xs sm:max-w-md md:max-w-lg object-contain drop-shadow-[0_4px_20px_rgba(200,162,122,0.3)]"
            />
            <p className="text-biscuit font-display text-lg tracking-widest uppercase mt-4 font-bold">
              House Of Induva
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
