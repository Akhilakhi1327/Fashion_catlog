const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 25;
  const skip = (page - 1) * limit;

  const [logs, totalLogs] = await Promise.all([
    AuditLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      logs,
      totalLogs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
    },
  });
});

module.exports = { getAuditLogs };
