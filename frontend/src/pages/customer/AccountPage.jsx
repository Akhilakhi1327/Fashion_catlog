import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiHeart, FiHeadphones, FiUser, FiLogOut, FiShoppingBag } from 'react-icons/fi';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import SEO from '../../components/SEO';

const AccountPage = () => {
  const { customerInfo, logout } = useCustomerAuth();
  const { cartItems } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const gridTiles = [
    { label: 'My Orders', sublabel: 'Track & manage', icon: FiPackage, path: '/my-orders', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Wishlist', sublabel: 'Saved items', icon: FiHeart, path: '/wishlist', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
    { label: 'Cart', sublabel: `${cartItems?.length || 0} items`, icon: FiShoppingBag, path: '/cart', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Help Center', sublabel: 'Support & FAQs', icon: FiHeadphones, path: '/help', color: 'text-primary', bg: 'bg-cream', border: 'border-biscuit' },
  ];

  if (!customerInfo) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <SEO title="Account" description="Sign in to your IndhuVadhana account" />

        <div className="bg-primary px-4 pt-12 pb-8">
          <div className="max-w-2xl mx-auto flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 flex-shrink-0">
              <FiUser className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl">Hello, Guest!</p>
              <p className="text-cream/80 text-sm">Sign in for a personalized experience</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <p className="text-gray-600 text-sm text-center">Sign in to access orders, wishlist & more</p>
            <div className="flex gap-3">
              <Link to="/login" className="flex-1 bg-primary text-white font-bold py-3 rounded-xl text-center text-sm shadow-md">
                Sign In
              </Link>
              <Link to="/register" className="flex-1 border-2 border-primary text-primary font-bold py-3 rounded-xl text-center text-sm">
                Register
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {gridTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <div key={tile.label} className={`${tile.bg} ${tile.border} border rounded-2xl p-5 flex flex-col gap-3 opacity-50`}>
                  <div className={`${tile.color} w-10 h-10 rounded-xl flex items-center justify-center bg-white/60`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">{tile.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{tile.sublabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const initials = customerInfo.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SEO title="My Account" description="Manage your IndhuVadhana account" />

      {/* Profile Banner */}
      <div className="bg-primary px-4 pt-12 pb-8">
        <div className="max-w-2xl mx-auto flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-biscuit flex items-center justify-center border-2 border-white/40 shadow-lg flex-shrink-0">
            <span className="text-primary font-bold text-xl font-display">{initials}</span>
          </div>
          <div>
            <p className="text-white font-bold text-xl font-display">{customerInfo.name}</p>
            <p className="text-cream/80 text-sm">{customerInfo.email}</p>
            {customerInfo.phone && <p className="text-cream/70 text-xs mt-0.5">{customerInfo.phone}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          {gridTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.label}
                to={tile.path}
                className={`${tile.bg} border ${tile.border} rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all active:scale-95`}
              >
                <div className={`${tile.color} w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{tile.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tile.sublabel}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account</p>
          </div>
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold text-gray-800">{customerInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold text-gray-800 text-xs truncate ml-4">{customerInfo.email}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 transition-colors"
          >
            <div className="bg-red-50 text-red-500 p-2.5 rounded-xl flex-shrink-0">
              <FiLogOut className="w-5 h-5" />
            </div>
            <span className="font-semibold text-red-600 text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
