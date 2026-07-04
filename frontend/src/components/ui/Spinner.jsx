import React from 'react';

const Spinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const spinnerMarkup = (
    <div
      className={`${sizeClasses[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {spinnerMarkup}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinnerMarkup}</div>;
};

export default Spinner;
