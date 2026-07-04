import React from 'react';

const Badge = ({ status }) => {
  const styles = {
    // Order statuses
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    Delivered: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    
    // Inventory/stock statuses
    'In Stock': 'bg-green-100 text-green-800 border-green-200',
    'Low Stock': 'bg-orange-100 text-orange-800 border-orange-200',
    'Out of Stock': 'bg-red-100 text-red-800 border-red-200',
  };

  const currentStyle = styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {status}
    </span>
  );
};

export default Badge;
