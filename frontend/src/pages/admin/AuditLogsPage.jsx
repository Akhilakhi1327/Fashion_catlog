import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useToast } from '../../context/ToastContext';
import { FiActivity, FiServer, FiUser, FiInfo } from 'react-icons/fi';

const AuditLogsPage = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchAuditLogsList = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/audit-logs`, { params: { page, limit: 15 } });
      if (res.data?.success) {
        setLogs(res.data.data.logs);
        setTotalLogs(res.data.data.totalLogs);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      toast.error('Failed to load system audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogsList();
  }, [page]);

  const getActionColor = (action) => {
    if (action.includes('CREATE')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('DELETE')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (action.includes('UPDATE')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">System Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Trace administrative changes, inventory updates, and logins</p>
      </div>

      {loading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl">
          <FiActivity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No system activities logged yet.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-indigo-950 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Administrator</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Network Info</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Action Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Admin User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-bold text-gray-950">{log.adminName}</p>
                          <p className="text-xs text-gray-400">{log.admin?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4 max-w-xs sm:max-w-md break-words text-gray-600 font-medium">
                      {log.details}
                    </td>

                    {/* Network Info */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      <div className="flex flex-col space-y-0.5">
                        <span className="flex items-center space-x-1">
                          <FiServer className="w-3.5 h-3.5 text-gray-400" />
                          <span>IP: {log.ipAddress || 'Unknown'}</span>
                        </span>
                        <span className="truncate max-w-[150px]" title={log.userAgent}>
                          UA: {log.userAgent || 'Unknown'}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-semibold">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default AuditLogsPage;
