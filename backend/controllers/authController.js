const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password
    });

    // Generate OTP for verification
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.verificationOTP = otp;
    user.verificationOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Send OTP via SMS/Email
    console.log(`📱 OTP for ${phone}: ${otp}`);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to your phone.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified
      },
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is banned
    if (user.isBannedNow()) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned',
        banReason: user.banReason,
        banExpiry: user.banExpiry
      });
    }

    // Generate token
    const token = generateToken(user._id);

    user.lastActive = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        reputation: user.reputation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is valid
    if (user.verificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired
    if (user.verificationOTPExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Mark user as verified
    user.verified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      user: {
        id: user._id,
        verified: user.verified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Private
exports.resendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.verificationOTP = otp;
    user.verificationOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // TODO: Send OTP via SMS/Email
    console.log(`📱 New OTP for ${user.phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      language: req.body.language,
      notificationPreferences: req.body.notificationPreferences
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add emergency contact
// @route   POST /api/auth/emergency-contacts
// @access  Private
exports.addEmergencyContact = async (req, res) => {
  try {
    const { name, phone, relation } = req.body;
    const user = await User.findById(req.user.id);

    if (user.emergencyContacts.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 emergency contacts allowed'
      });
    }

    user.emergencyContacts.push({ name, phone, relation });
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Emergency contact added',
      data: user.emergencyContacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get emergency contacts
// @route   GET /api/auth/emergency-contacts
// @access  Private
exports.getEmergencyContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.emergencyContacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/auth/emergency-contacts/:id
// @access  Private
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.emergencyContacts = user.emergencyContacts.filter(
      contact => contact._id.toString() !== req.params.id
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted',
      data: user.emergencyContacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
