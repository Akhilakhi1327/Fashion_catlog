import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';
import { FiCheckCircle } from 'react-icons/fi';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, loading } = useCustomerAuth();
  const toast = useToast();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }
    try {
      await verifyOtp(email, otp);
      toast.success('Email verified successfully! You are now logged in.');
      navigate('/');
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fade-in text-center">
        <FiCheckCircle className="mx-auto w-16 h-16 text-indigo-500" />
        <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight mt-4">
          Verify Your Email
        </h2>
        <p className="mt-2 text-sm text-gray-500 font-medium">
          We've sent a 6-digit verification code to <br />
          <strong className="text-gray-900">{email}</strong>
        </p>

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div>
            <label className="label text-left">Enter 6-Digit OTP</label>
            <input
              type="text"
              required
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="input w-full text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
