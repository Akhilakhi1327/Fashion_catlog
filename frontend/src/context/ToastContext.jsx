import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showSuccess = (message) => toast.success(message, {
    style: {
      background: '#1e1b4b',
      color: '#fff',
      border: '1px solid #ec4899',
    },
    iconTheme: {
      primary: '#ec4899',
      secondary: '#fff',
    },
  });

  const showError = (message) => toast.error(message, {
    style: {
      background: '#7f1d1d',
      color: '#fff',
      border: '1px solid #f87171',
    },
  });

  const showInfo = (message) => toast(message, {
    style: {
      background: '#1e293b',
      color: '#fff',
    },
    icon: 'ℹ️',
  });

  return (
    <ToastContext.Provider value={{ success: showSuccess, error: showError, info: showInfo }}>
      <Toaster position="bottom-right" reverseOrder={false} />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
