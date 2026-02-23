const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const crimeReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    // required: true  // Removed since it's auto-generated in pre-save
  },
  type: {
    type: String,
    required: [true, 'Please specify crime type'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    minlength: [20, 'Description must be at least 20 characters']
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
      required: true
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'Validated', 'Investigating', 'Resolved', 'Rejected'],
    default: 'Pending'
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
  isAnonymous: {
    type: Boolean,
    default: true
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document']
    },
    url: String,
    filename: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  validations: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validated: {
      type: Boolean,
      default: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    comment: String
  }],
  validationCount: {
    type: Number,
    default: 0
  },
  autoValidated: {
    type: Boolean,
    default: false
  },
  notificationsSent: {
    type: Number,
    default: 0
  },
  policeStationsNotified: [{
    stationId: String,
    stationName: String,
    notifiedAt: Date,
    acknowledged: Boolean,
    acknowledgedAt: Date
  }],
  investigationNotes: [{
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: String,
  isFake: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for geospatial queries
crimeReportSchema.index({ location: '2dsphere' });
crimeReportSchema.index({ status: 1, createdAt: -1 });
crimeReportSchema.index({ type: 1 });
crimeReportSchema.index({ userId: 1 });

// Generate unique report ID
crimeReportSchema.pre('save', async function(next) {
  if (!this.reportId) {
    this.reportId = 'CR-' + randomUUID();
  }
  next();
});

// Auto-validate if 5+ validations
crimeReportSchema.methods.checkAutoValidation = function() {
  if (this.validationCount >= 5 && this.status === 'Pending') {
    this.status = 'Validated';
    this.autoValidated = true;
    return true;
  }
  return false;
};

module.exports = mongoose.model('CrimeReport', crimeReportSchema);
