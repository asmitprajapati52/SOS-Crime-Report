const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyOTP,
  resendOTP,
  getMe,
  updateProfile,
  addEmergencyContact,
  getEmergencyContacts,
  deleteEmergencyContact
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/verify-otp', protect, verifyOTP);
router.post('/resend-otp', protect, resendOTP);
router.get('/me', protect, getMe);
router.put('/update', protect, updateProfile);
router.post('/emergency-contacts', protect, addEmergencyContact);
router.get('/emergency-contacts', protect, getEmergencyContacts);
router.delete('/emergency-contacts/:id', protect, deleteEmergencyContact);

module.exports = router;
