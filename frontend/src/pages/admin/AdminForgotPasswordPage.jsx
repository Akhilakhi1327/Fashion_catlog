import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FiMail, FiArrowLeft, FiShield } from 'react-icons/fi';

const AdminForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data?.success) {
        setIsSent(true);
        toast.success('Admin password reset link sent successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send admin reset link. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-indigo-950/5">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 animate-fade-in">
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-950 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight">
            Admin Password Recovery
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Enter admin email to receive a recovery link
          </p>
        </div>

        {isSent ? (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-2xl p-6 text-center space-y-4">
            <p className="font-medium text-sm">
              We've sent a recovery link to <br/> <strong>{email}</strong>
            </p>
            <p className="text-xs text-indigo-600">Please check your inbox (and spam folder).</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={submitHandler}>
            <div>
              <label className="label text-gray-700 font-bold">Admin Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="admin@elitefashion.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-950 hover:bg-indigo-900 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors flex justify-center items-center"
            >
              {loading ? 'Sending...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/admin/login" className="inline-flex items-center space-x-2 text-sm font-bold text-indigo-600 hover:text-indigo-500">
            <FiArrowLeft />
            <span>Back to Admin Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPasswordPage;
