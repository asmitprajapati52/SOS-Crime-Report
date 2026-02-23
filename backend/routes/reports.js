const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReport,
  validateReport,
  getMyReports,
  updateReportStatus,
  addInvestigationNote,
  getStatistics,
  getCrimeDensity
} = require('../controllers/reportController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, getReports);
router.get('/stats/all', getStatistics);
router.get('/density/areas', getCrimeDensity);
router.get('/:id', getReport);

// Protected routes (all users)
router.post('/', protect, createReport);
router.post('/:id/validate', protect, validateReport);
router.get('/my/all', protect, getMyReports);

// Protected routes (admin/police only)
router.put('/:id/status', protect, authorize('admin', 'police'), updateReportStatus);
router.post('/:id/notes', protect, authorize('admin', 'police'), addInvestigationNote);

module.exports = router;
