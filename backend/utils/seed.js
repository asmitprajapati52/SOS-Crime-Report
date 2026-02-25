require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CrimeReport = require('../models/CrimeReport');
const SOSAlert = require('../models/SOSAlert');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await CrimeReport.deleteMany();
    await SOSAlert.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
    const hashedUserPassword = await bcrypt.hash('password123', 10);
    const hashedPolicePassword = await bcrypt.hash('Police@123', 10);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@sahayata.com',
      phone: '+919876543210',
      password: hashedAdminPassword,
      role: 'admin',
      verified: true
    });
    console.log('✅ Admin user created');

    // Create sample users
    const users = await User.create([
      {
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        phone: '+919876543211',
        password: hashedUserPassword,
        verified: true,
        emergencyContacts: [
          { name: 'Mother', phone: '+919876543212', relation: 'Mother' },
          { name: 'Friend', phone: '+919876543213', relation: 'Friend' }
        ]
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+919876543214',
        password: hashedUserPassword,
        verified: true
      },
      {
        name: 'Police Officer',
        email: 'police@sahayata.com',
        phone: '+919876543215',
        password: hashedPolicePassword,
        role: 'police',
        verified: true
      }
    ]);
    console.log('✅ Sample users created');

    // Create sample crime reports
    const reports = await CrimeReport.create([
      {
        reportId: 'CR-' + Date.now(),
        type: 'Theft',
        description: 'Mobile phone stolen from pocket in crowded market area.',
        location: { type: 'Point', coordinates: [77.2167, 28.6315], address: 'Connaught Place, New Delhi' },
        severity: 'high',
        status: 'Validated',
        userId: users[0]._id,
        userName: 'Rahul Kumar',
        isAnonymous: false,
        validationCount: 5
      },
      {
        reportId: 'CR-' + (Date.now() + 1),
        type: 'Assault',
        description: 'Physical assault near metro station late evening.',
        location: { type: 'Point', coordinates: [77.2066, 28.5244], address: 'Saket, New Delhi' },
        severity: 'high',
        status: 'Pending',
        userId: users[1]._id,
        userName: 'Anonymous',
        isAnonymous: true,
        validationCount: 3
      }
    ]);
    console.log('✅ Sample crime reports created');

    // Create sample SOS alerts
    const sosAlerts = await SOSAlert.create([
      {
        alertId: 'SOS-' + Date.now(),
        type: 'Assault / Attack',
        message: 'Being followed by suspicious individuals. Need immediate help!',
        location: { type: 'Point', coordinates: [77.0736, 28.7495], address: 'Rohini, New Delhi' },
        userId: users[0]._id,
        userName: 'Rahul Kumar',
        userPhone: users[0].phone,
        status: 'Active',
        notifiedEntities: { nearbyUsers: 46, policeStations: 3, ngos: 6, media: 2, emergencyContacts: 2 },
        totalNotified: 57
      }
    ]);
    console.log('✅ Sample SOS alerts created');

    console.log(`
╔═══════════════════════════════════════════╗
║   ✅ Database Seeded Successfully!        ║
╠═══════════════════════════════════════════╣
║   Users: ${users.length + 1} (including admin)      ║
║   Crime Reports: ${reports.length}                     ║
║   SOS Alerts: ${sosAlerts.length}                       ║
╠═══════════════════════════════════════════╣
║   Login Credentials:                        ║
║   Admin:  admin@sahayata.com / Admin@123    ║
║   User:   rahul@example.com / password123   ║
║   Police: police@sahayata.com / Police@123  ║
╚═══════════════════════════════════════════╝
    `);

  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
  } finally {
    mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
};

connectDB().then(() => seedData());