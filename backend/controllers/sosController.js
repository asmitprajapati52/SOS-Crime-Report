const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');

// @desc    Create SOS alert
// @route   POST /api/sos
// @access  Private
exports.createSOSAlert = async (req, res) => {
  try {
    console.log('Received SOS request:', req.body);
    const { type, message, location } = req.body;

    // Validate required fields
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Emergency type is required'
      });
    }
    if (!location || !location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2 || !location.coordinates.every(coord => typeof coord === 'number' && !isNaN(coord))) {
      return res.status(400).json({
        success: false,
        message: 'Valid location coordinates (numbers) are required'
      });
    }

    console.log('User ID:', req.user.id);
    // Get user with emergency contacts
    const user = await User.findById(req.user.id);
    console.log('User found:', !!user);

    // Create SOS alert
    console.log('Creating alert with data:', {
      type,
      message,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
        accuracy: location.accuracy
      },
      userId: req.user.id,
      userName: user.name,
      userPhone: user.phone
    });
    const alert = await SOSAlert.create({
      type,
      message,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
        accuracy: location.accuracy
      },
      userId: req.user.id,
      userName: user.name,
      userPhone: user.phone
    });
    console.log('Alert created:', alert.alertId);

    // Simulate notifications (in real app, would send actual notifications)
    const nearbyUsers = 46;
    const policeStations = 3;
    const ngos = 6;
    const media = 2;
    const emergencyContacts = user.emergencyContacts || [];
    const emergencyContactsCount = emergencyContacts.length;

    alert.notifiedEntities = {
      nearbyUsers,
      policeStations,
      ngos,
      media,
      emergencyContacts: emergencyContactsCount
    };

    alert.calculateTotalNotified();

    // Mark emergency contacts as notified
    alert.emergencyContactsNotified = emergencyContacts.map(contact => ({
      contactId: contact._id,
      name: contact.name,
      phone: contact.phone,
      notifiedAt: Date.now(),
      notificationStatus: 'sent'
    }));

    await alert.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { sosAlertsTriggered: 1 }
    });

    // TODO: Send actual notifications to nearby users, police, NGOs, etc.
    console.log(`🚨 SOS Alert: ${alert.alertId} - ${alert.totalNotified} entities notified`);

    res.status(201).json({
      success: true,
      message: 'SOS alert sent successfully',
      data: {
        alertId: alert.alertId,
        totalNotified: alert.totalNotified,
        notifiedEntities: alert.notifiedEntities,
        status: alert.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all SOS alerts
// @route   GET /api/sos
// @access  Private (Admin/Police)
exports.getSOSAlerts = async (req, res) => {
  try {
    const { 
      status,
      lat,
      lng,
      radius = 10000,
      limit = 20,
      page = 1
    } = req.query;

    let query = {};

    if (status) query.status = status;

    // Geospatial query
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const alerts = await SOSAlert.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await SOSAlert.countDocuments(query);

    // Add time elapsed to each alert
    const alertsWithTime = alerts.map(alert => ({
      ...alert.toObject(),
      timeElapsed: alert.getTimeElapsed()
    }));

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: alertsWithTime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single SOS alert
// @route   GET /api/sos/:id
// @access  Private
exports.getSOSAlert = async (req, res) => {
  try {
    const alert = await SOSAlert.findById(req.params.id)
      .populate('userId', 'name phone');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...alert.toObject(),
        timeElapsed: alert.getTimeElapsed()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my SOS alerts
// @route   GET /api/sos/my/all
// @access  Private
exports.getMySOSAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.user.id })
      .sort('-createdAt');

    const alertsWithTime = alerts.map(alert => ({
      ...alert.toObject(),
      timeElapsed: alert.getTimeElapsed()
    }));

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alertsWithTime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update SOS alert status
// @route   PUT /api/sos/:id/status
// @access  Private (Admin/Police)
exports.updateSOSStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    const alert = await SOSAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    alert.status = status;

    if (status === 'Responded') {
      alert.respondedAt = Date.now();
      alert.respondedBy = req.user.id;
    }

    if (status === 'Resolved') {
      alert.resolvedAt = Date.now();
      alert.resolutionNotes = resolutionNotes;
    }

    if (status === 'False Alarm') {
      alert.isFake = true;
      
      // Increment fake alert count for user
      const user = await User.findById(alert.userId);
      user.fakeAlertCount += 1;

      // Auto-ban logic
      if (user.fakeAlertCount >= 5) {
        user.isBanned = true;
        user.banReason = 'Multiple false SOS alerts';
      } else if (user.fakeAlertCount >= 3) {
        user.isBanned = true;
        user.banExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        user.banReason = '3 false SOS alerts - Temporary ban';
      }

      await user.save();
    }

    await alert.save();

    res.status(200).json({
      success: true,
      message: 'SOS alert status updated',
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add response to SOS alert
// @route   POST /api/sos/:id/respond
// @access  Private
exports.respondToSOS = async (req, res) => {
  try {
    const { eta, message, location } = req.body;

    const alert = await SOSAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    if (alert.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This alert is no longer active'
      });
    }

    alert.responses.push({
      responderId: req.user.id,
      responderName: req.user.name,
      responderType: req.user.role,
      eta,
      message,
      location: location ? {
        type: 'Point',
        coordinates: location.coordinates
      } : undefined
    });

    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Response added to SOS alert',
      data: alert.responses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add live update to SOS alert
// @route   POST /api/sos/:id/update
// @access  Private
exports.addLiveUpdate = async (req, res) => {
  try {
    const { message } = req.body;

    const alert = await SOSAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    // Only alert creator or admin/police can add updates
    if (alert.userId.toString() !== req.user.id && !['admin', 'police'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this alert'
      });
    }

    alert.liveUpdates.push({
      message,
      postedBy: req.user.name
    });

    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Live update added',
      data: alert.liveUpdates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get active SOS alerts nearby
// @route   GET /api/sos/nearby/active
// @access  Private
exports.getNearbyActiveAlerts = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const alerts = await SOSAlert.find({
      status: 'Active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).limit(10);

    const alertsWithTime = alerts.map(alert => ({
      ...alert.toObject(),
      timeElapsed: alert.getTimeElapsed()
    }));

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alertsWithTime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
