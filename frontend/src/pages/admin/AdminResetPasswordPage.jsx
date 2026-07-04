import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FiLock, FiCheckCircle, FiShield } from 'react-icons/fi';

const AdminResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      if (res.data?.success) {
        setIsSuccess(true);
        toast.success('Admin password updated successfully!');
        setTimeout(() => navigate('/admin/login'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Token is invalid or expired. Please request another reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-indigo-950/5">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 animate-fade-in">
        {isSuccess ? (
          <div className="text-center py-8">
            <FiCheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recovery Successful!</h2>
            <p className="text-gray-500 text-sm">Redirecting you to admin login page...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-950 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight">
                Update Admin Password
              </h2>
              <p className="mt-2 text-sm text-gray-500 font-medium">
                Please enter a secure password below
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={submitHandler}>
              <div className="space-y-4">
                <div>
                  <label className="label text-gray-700 font-bold">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-10 w-full"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>
                <div>
                  <label className="label text-gray-700 font-bold">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input pl-10 w-full"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-950 hover:bg-indigo-900 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors flex justify-center items-center"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminResetPasswordPage;
