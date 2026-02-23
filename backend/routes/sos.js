const express = require('express');
const router = express.Router();
const {
  createSOSAlert,
  getSOSAlerts,
  getSOSAlert,
  getMySOSAlerts,
  updateSOSStatus,
  respondToSOS,
  addLiveUpdate,
  getNearbyActiveAlerts
} = require('../controllers/sosController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.post('/', protect, createSOSAlert);
router.get('/', protect, authorize('admin', 'police'), getSOSAlerts);
router.get('/my/all', protect, getMySOSAlerts);
router.get('/nearby/active', protect, getNearbyActiveAlerts);
router.get('/:id', protect, getSOSAlert);
router.put('/:id/status', protect, authorize('admin', 'police'), updateSOSStatus);
router.post('/:id/respond', protect, respondToSOS);
router.post('/:id/update', protect, addLiveUpdate);

module.exports = router;
