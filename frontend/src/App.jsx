import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import VerifyOTPPage from './pages/customer/VerifyOTPPage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
import ResetPasswordPage from './pages/customer/ResetPasswordPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import WishlistPage from './pages/customer/WishlistPage';
import AccountPage from './pages/customer/AccountPage';
import HelpCenterPage from './pages/customer/HelpCenterPage';
import CategoriesPage from './pages/CategoriesPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsManagePage from './pages/admin/ProductsManagePage';
import AddProductPage from './pages/admin/AddProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import InventoryPage from './pages/admin/InventoryPage';
import OrdersManagePage from './pages/admin/OrdersManagePage';
import ReviewsManagePage from './pages/admin/ReviewsManagePage';
import AdminForgotPasswordPage from './pages/admin/AdminForgotPasswordPage';
import AdminResetPasswordPage from './pages/admin/AdminResetPasswordPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* User Facing / Shop routes wrapped inside main Layout */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/:id" element={<ProductDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  
                  {/* Customer Auth & Account Routes */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="verify-otp" element={<VerifyOTPPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="my-orders" element={<MyOrdersPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="account" element={<AccountPage />} />
                  <Route path="help" element={<HelpCenterPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                </Route>

                {/* Admin Authentication Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
                <Route path="/admin/reset-password/:token" element={<AdminResetPasswordPage />} />

                {/* Admin Panel routes wrapped inside AdminLayout (Protected) */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="products" element={<ProductsManagePage />} />
                  <Route path="products/add" element={<AddProductPage />} />
                  <Route path="products/:id/edit" element={<EditProductPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="orders" element={<OrdersManagePage />} />
                  <Route path="reviews" element={<ReviewsManagePage />} />
                  <Route path="audit-logs" element={<AuditLogsPage />} />
                </Route>

                {/* Fallback route - Redirect any other path to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
