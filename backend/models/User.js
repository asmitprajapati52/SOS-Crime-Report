const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please provide a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'police'],
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationOTP: String,
  verificationOTPExpire: Date,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String
  },
  emergencyContacts: [{
    name: String,
    phone: String,
    relation: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reputation: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  reportsSubmitted: {
    type: Number,
    default: 0
  },
  validationsGiven: {
    type: Number,
    default: 0
  },
  sosAlertsTriggered: {
    type: Number,
    default: 0
  },
  fakeAlertCount: {
    type: Number,
    default: 0
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banExpiry: Date,
  banReason: String,
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = Date.now();
  return this.save();
};

// Check if user is banned
userSchema.methods.isBannedNow = function() {
  if (!this.isBanned) return false;
  if (this.banExpiry && this.banExpiry < Date.now()) {
    this.isBanned = false;
    this.banExpiry = undefined;
    this.save();
    return false;
  }
  return true;
};

module.exports = mongoose.model('User', userSchema);
