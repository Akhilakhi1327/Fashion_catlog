import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiGrid, FiUser, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

const BottomNav = () => {
  const { cartItems } = useCart();
  const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  const tabs = [
    { label: 'Home', icon: FiHome, path: '/' },
    { label: 'Categories', icon: FiGrid, path: '/categories' },
    { label: 'Account', icon: FiUser, path: '/account' },
    { label: 'Cart', icon: FiShoppingCart, path: '/cart', badge: cartCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-3">
      <div className="grid grid-cols-4 h-16 rounded-[1.4rem] border border-white/70 bg-white/90 backdrop-blur-xl shadow-[0_-10px_30px_rgba(74,44,34,0.14)] overflow-hidden">
        {tabs.map(({ label, icon: Icon, path, badge }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
              }`
            }
          >
            {path === '/' && (
              <span className="absolute inset-x-4 top-2 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#b8895f] to-transparent opacity-50" />
            )}
            <div className="relative">
              <Icon className="w-6 h-6" />
              {badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#4b2c24] text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow-md">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
