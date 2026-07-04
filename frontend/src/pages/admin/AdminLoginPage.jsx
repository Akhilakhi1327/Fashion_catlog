import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminLoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in email and password fields');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password.trim());
    setLoading(false);

    if (res.success) {
      toast.success('Welcome back, Administrator!');
      navigate('/admin/dashboard', { replace: true });
    } else {
      toast.error(res.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-gray-50">
      {/* Left decorative column */}
      <div className="hidden md:flex md:col-span-7 lg:col-span-8 bg-black text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C8A27A_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative">
          <img src="/logo.png" alt="IndhuVadhana" className="h-20 object-contain" />
        </div>
        <div className="relative space-y-4 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight text-white">
            Inventory & Catalog Management
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            Secure administrative control portal for publishing catalog collections, replenishing inventory stock, tracking client order requests, and evaluating sales metrics.
          </p>
        </div>
        <div className="relative text-xs text-gray-500 font-medium flex items-center space-x-4">
          <span>&copy; {new Date().getFullYear()} IndhuVadhana.</span>
          <Link to="/" className="text-biscuit hover:text-white transition-colors underline">Go back to Shop</Link>
        </div>
      </div>

      {/* Right form column */}
      <div className="col-span-1 md:col-span-5 lg:col-span-4 flex items-center justify-center p-8 bg-white border-l">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold font-display text-gray-900">Administrator Portal</h2>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sign in to manage catalog operations</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="label" htmlFor="adminEmail">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  id="adminEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password field with eye toggle */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0" htmlFor="adminPass">Security Password</label>
                <Link to="/admin/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  id="adminPass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-12"
                />
                {/* Eye icon toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3 bg-primary hover:bg-primary/90 text-white"
            >
              <FiLogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>

            {/* Mobile Back to Home */}
            <div className="md:hidden text-center pt-4">
              <Link to="/" className="text-sm font-semibold text-primary hover:underline">
                &larr; Back to Shop Home
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
