import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';
import { FiMenu } from 'react-icons/fi';

const AdminLayout = () => {
  const { admin, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return <Spinner fullScreen />;
  }

  // Redirect to admin login if not logged in
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar navigation */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main page content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 font-display hidden sm:block">IndhuVadhana Admin</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs bg-cream text-primary border border-biscuit font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              {admin.role}
            </span>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
