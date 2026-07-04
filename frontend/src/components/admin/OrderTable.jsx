import React, { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import Badge from '../ui/Badge';

const OrderTable = ({ orders, onStatusUpdate, onDelete, loading }) => {
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    await onStatusUpdate(id, newStatus);
    setUpdatingId(null);
  };

  const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white border rounded-2xl">
        <span className="text-4xl block mb-2">📦</span>
        <h3 className="text-base font-bold text-gray-900 font-display">No Orders Found</h3>
        <p className="text-sm text-gray-500 mt-1">There are no orders on record right now.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-950 text-white text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Product Ordered</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Order Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
            {orders.map((order) => {
              const prod = order.product;
              const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Customer Details */}
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]" title={order.address}>
                      📍 {order.address}
                    </p>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 font-mono text-xs">{order.phone}</td>

                  {/* Product */}
                  <td className="px-6 py-4">
                    {prod ? (
                      <div className="flex items-center space-x-3">
                        {prod.images && prod.images.length > 0 && (
                          <img
                            src={prod.images[0].url}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg border bg-gray-50"
                          />
                        )}
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                          <p className="text-xs text-gray-400">Category: {prod.category}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-red-500 font-bold">Deleted Product</span>
                    )}
                  </td>

                  {/* Qty */}
                  <td className="px-6 py-4 font-bold">{order.quantity}</td>

                  {/* Date */}
                  <td className="px-6 py-4 text-xs text-gray-500">{date}</td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <Badge status={order.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <div className="inline-block relative">
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="border border-gray-300 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => onDelete(order._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors focus:outline-none"
                        title="Delete Order"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
