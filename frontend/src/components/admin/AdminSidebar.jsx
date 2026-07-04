import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiShoppingBag,
  FiPlusSquare,
  FiDatabase,
  FiBox,
  FiLogOut,
  FiHome,
  FiMessageSquare,
  FiActivity,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminSidebar = ({ isCollapsed, onToggle, onClose }) => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { name: 'Add Product', path: '/admin/products/add', icon: FiPlusSquare },
    { name: 'Manage Products', path: '/admin/products', icon: FiBox },
    { name: 'Inventory Logs', path: '/admin/inventory', icon: FiDatabase },
    { name: 'Customer Orders', path: '/admin/orders', icon: FiShoppingBag },
    { name: 'Manage Reviews', path: '/admin/reviews', icon: FiMessageSquare },
    { name: 'System Audit Logs', path: '/admin/audit-logs', icon: FiActivity },
  ];

  return (
    <aside className="bg-white text-gray-800 w-64 h-full flex flex-col justify-between border-r border-gray-200 shadow-lg flex-shrink-0">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-gray-200 bg-black flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 block w-full">
            <img src="/logo.png" alt="IndhuVadhana" className="h-14 object-contain w-full" />
          </Link>
        </div>
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-lg text-white shadow-sm">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-gray-900">{admin?.name || 'Administrator'}</p>
            <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1.5 flex-grow overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-cream text-primary border border-biscuit shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Control Area */}
      <div className="p-4 space-y-1.5 border-t border-gray-200 bg-gray-50">
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:text-primary transition-all border border-transparent hover:border-gray-200 shadow-sm"
        >
          <FiHome className="w-5 h-5 flex-shrink-0" />
          <span>Go to Live Shop</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all border border-transparent hover:border-red-100 shadow-sm focus:outline-none"
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
