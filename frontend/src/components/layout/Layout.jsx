import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import SubpageNavbar from './SubpageNavbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-sans">
      {isHome ? <Navbar /> : <SubpageNavbar />}
      <main className="flex-grow pb-16 md:pb-0">
        <Outlet />
      </main>
      {/* Footer only on Home page */}
      {isHome && <Footer />}
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
