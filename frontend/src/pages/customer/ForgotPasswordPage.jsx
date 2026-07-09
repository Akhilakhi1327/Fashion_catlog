import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword, loading, error } = useCustomerAuth();
  const toast = useToast();

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.success('Password reset link sent successfully!');
    } catch (err) {
      // Handled in context & useEffect
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Enter your email to receive a password reset link
          </p>
        </div>

        {isSent ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 text-center space-y-4">
            <p className="font-medium text-sm">
              We've sent a password reset link to <br/> <strong>{email}</strong>
            </p>
            <p className="text-xs text-green-600">Please check your inbox (and spam folder).</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={submitHandler}>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center space-x-2 text-sm font-bold text-indigo-600 hover:text-indigo-500">
            <FiArrowLeft />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
