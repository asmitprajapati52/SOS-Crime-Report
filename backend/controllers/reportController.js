const CrimeReport = require('../models/CrimeReport');
const User = require('../models/User');

// @desc    Create crime report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { type, description, location, isAnonymous, evidence } = req.body;

    // Create report
    const report = await CrimeReport.create({
      type,
      description,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      },
      userId: req.user.id,
      userName: isAnonymous ? 'Anonymous' : req.user.name,
      isAnonymous,
      evidence: evidence || []
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { reportsSubmitted: 1 }
    });

    // TODO: Notify police stations, NGOs, etc.
    console.log(`📝 New crime report: ${report.reportId}`);

    res.status(201).json({
      success: true,
      message: 'Crime report submitted successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all crime reports
// @route   GET /api/reports
// @access  Public
exports.getReports = async (req, res) => {
  try {
    const { 
      type, 
      status, 
      severity,
      lat,
      lng,
      radius = 10000, // 10km default
      limit = 20,
      page = 1,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (severity) query.severity = severity;

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

    // Execute query
    const reports = await CrimeReport.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-userId'); // Don't expose user IDs for anonymous reports

    const total = await CrimeReport.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single crime report
// @route   GET /api/reports/:id
// @access  Public
exports.getReport = async (req, res) => {
  try {
    const report = await CrimeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Increment views
    report.views += 1;
    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Validate crime report
// @route   POST /api/reports/:id/validate
// @access  Private
exports.validateReport = async (req, res) => {
  try {
    const report = await CrimeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user already validated
    const alreadyValidated = report.validations.some(
      v => v.userId.toString() === req.user.id
    );

    if (alreadyValidated) {
      return res.status(400).json({
        success: false,
        message: 'You have already validated this report'
      });
    }

    // Add validation
    report.validations.push({
      userId: req.user.id,
      validated: true,
      comment: req.body.comment
    });

    report.validationCount += 1;

    // Check for auto-validation
    const autoValidated = report.checkAutoValidation();

    await report.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { validationsGiven: 1 }
    });

    res.status(200).json({
      success: true,
      message: autoValidated ? 'Report auto-validated!' : 'Validation added',
      data: {
        validationCount: report.validationCount,
        status: report.status,
        autoValidated
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my reports
// @route   GET /api/reports/my/all
// @access  Private
exports.getMyReports = async (req, res) => {
  try {
    const reports = await CrimeReport.find({ userId: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update report status (Admin/Police only)
// @route   PUT /api/reports/:id/status
// @access  Private (Admin/Police)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    const report = await CrimeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;

    if (status === 'Resolved') {
      report.resolvedAt = Date.now();
      report.resolvedBy = req.user.id;
      report.resolutionNotes = resolutionNotes;
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report status updated',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add investigation note
// @route   POST /api/reports/:id/notes
// @access  Private (Admin/Police)
exports.addInvestigationNote = async (req, res) => {
  try {
    const { note } = req.body;

    const report = await CrimeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.investigationNotes.push({
      officerId: req.user.id,
      note
    });

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Investigation note added',
      data: report.investigationNotes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get crime statistics
// @route   GET /api/reports/stats/all
// @access  Public
exports.getStatistics = async (req, res) => {
  try {
    // Total reports
    const totalReports = await CrimeReport.countDocuments();

    // Reports by status
    const reportsByStatus = await CrimeReport.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Reports by type
    const reportsByType = await CrimeReport.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Reports by severity
    const reportsBySeverity = await CrimeReport.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent reports (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentReports = await CrimeReport.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Validation rate
    const validatedReports = await CrimeReport.countDocuments({ 
      status: 'Validated' 
    });
    const validationRate = ((validatedReports / totalReports) * 100).toFixed(1);

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        reportsByStatus,
        reportsByType,
        reportsBySeverity,
        recentReports,
        validationRate: `${validationRate}%`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get crime density by area
// @route   GET /api/reports/density/areas
// @access  Public
exports.getCrimeDensity = async (req, res) => {
  try {
    // Define areas (this could be from a database)
    const areas = [
      { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
      { name: 'Saket', lat: 28.5244, lng: 77.2066 },
      { name: 'Dwarka', lat: 28.5921, lng: 77.0460 },
      { name: 'Rohini', lat: 28.7495, lng: 77.0736 },
      { name: 'Greater Kailash', lat: 28.5494, lng: 77.2426 }
    ];

    const density = await Promise.all(
      areas.map(async (area) => {
        const count = await CrimeReport.countDocuments({
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [area.lng, area.lat]
              },
              $maxDistance: 2500 // 2.5km radius
            }
          }
        });

        let risk = 'safe';
        if (count >= 3) risk = 'high';
        else if (count >= 1) risk = 'medium';

        return {
          ...area,
          count,
          risk
        };
      })
    );

    res.status(200).json({
      success: true,
      data: density
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
