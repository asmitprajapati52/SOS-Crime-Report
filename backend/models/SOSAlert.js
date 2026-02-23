const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const sosAlertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    unique: true,
    // required: true  // Removed since it's auto-generated in pre-save
  },
  type: {
    type: String,
    required: [true, 'Please specify emergency type'],
    trim: true
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      default: 'Current Location (GPS)'
    },
    accuracy: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    default: 'Anonymous'
  },
  userPhone: String,
  status: {
    type: String,
    enum: ['Active', 'Responded', 'Resolved', 'False Alarm'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'critical'
  },
  notifiedEntities: {
    nearbyUsers: { type: Number, default: 0 },
    policeStations: { type: Number, default: 0 },
    ngos: { type: Number, default: 0 },
    media: { type: Number, default: 0 },
    emergencyContacts: { type: Number, default: 0 }
  },
  totalNotified: {
    type: Number,
    default: 0
  },
  responses: [{
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    responderName: String,
    responderType: {
      type: String,
      enum: ['user', 'police', 'ngo', 'medical']
    },
    eta: String,
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  emergencyContactsNotified: [{
    contactId: String,
    name: String,
    phone: String,
    notifiedAt: Date,
    notificationStatus: String
  }],
  voiceRecording: {
    url: String,
    duration: Number,
    uploadedAt: Date
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  respondedAt: Date,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  resolutionNotes: String,
  isFake: {
    type: Boolean,
    default: false
  },
  verifiedByPolice: {
    type: Boolean,
    default: false
  },
  policeVerificationNotes: String,
  liveUpdates: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    postedBy: String
  }]
}, {
  timestamps: true
});

// Indexes
sosAlertSchema.index({ location: '2dsphere' });
sosAlertSchema.index({ status: 1, createdAt: -1 });
sosAlertSchema.index({ userId: 1 });
sosAlertSchema.index({ createdAt: -1 });

// Generate unique alert ID
sosAlertSchema.pre('save', async function(next) {
  if (!this.alertId) {
    this.alertId = 'SOS-' + randomUUID();
  }
  next();
});

// Calculate total notified
sosAlertSchema.methods.calculateTotalNotified = function() {
  const entities = this.notifiedEntities;
  this.totalNotified = 
    (entities.nearbyUsers || 0) + 
    (entities.policeStations || 0) + 
    (entities.ngos || 0) + 
    (entities.media || 0) + 
    (entities.emergencyContacts || 0);
  return this.totalNotified;
};

// Get time elapsed
sosAlertSchema.methods.getTimeElapsed = function() {
  const now = new Date();
  const created = this.createdAt;
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
