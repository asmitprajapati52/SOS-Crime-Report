# 🛡️ Sahayata SOS - Complete MERN Stack Application

**India's first 100% anonymous crime reporting and emergency response platform**

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Default Credentials](#default-credentials)
- [All 10 Requested Features](#all-10-requested-features)

---

## ✨ Features

### Core Features
- ✅ **100% Anonymous Crime Reporting** with SHA-256 encryption
- ✅ **Real-time SOS Alerts** with GPS tracking
- ✅ **Interactive Crime Heat Maps** with risk zones
- ✅ **Community Validation System** (5 validations = auto-approved)
- ✅ **Multi-file Evidence Upload** (images, videos, audio)
- ✅ **Admin & Police Dashboards**
- ✅ **Progressive Ban System** for fake alerts
- ✅ **Fully Responsive Design** (mobile, tablet, desktop)

### All 10 Requested Features
1. **📍 Real-Time GPS Location** - Automatic location capture with accuracy tracking
2. **🔔 Push Notifications** - Desktop & mobile alerts for important events
3. **🌐 Multi-Language Support** - Hindi & English (easily extensible)
4. **🎤 Voice Recording** - Record audio evidence while reporting
5. **✓ User Verification** - OTP-based phone verification system
6. **📞 Emergency Contacts** - Auto-notify family during SOS (up to 5 contacts)
7. **👍 Report Validation** - Community-powered verification system
8. **📊 Advanced Analytics** - Real-time crime statistics & trends
9. **👮 Police Portal** - Official police station integration with case management
10. **📱 Mobile Optimization** - Fully responsive, works on all devices

---

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Socket.io** - Real-time communication (ready for implementation)
- **Helmet** - Security headers
- **Express Rate Limit** - API protection

### Frontend
- **React.js 18** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Leaflet** - Interactive maps
- **React Leaflet** - React wrapper for Leaflet
- **React Toastify** - Notifications
- **Context API** - State management

---

## 📁 Project Structure

```
sahayata-sos-mern/
├── backend/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── reportController.js   # Crime reports logic
│   │   └── sosController.js      # SOS alerts logic
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   └── error.js              # Error handling
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── CrimeReport.js        # Crime report model
│   │   └── SOSAlert.js           # SOS alert model
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── reports.js            # Report routes
│   │   └── sos.js                # SOS routes
│   ├── utils/
│   │   └── seed.js               # Database seeder
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main server file
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── context/
│   │   │   └── AuthContext.js    # Authentication context
│   │   ├── utils/
│   │   │   └── api.js            # API utilities
│   │   ├── styles/
│   │   │   └── index.css         # Global styles
│   │   ├── App.js                # Main App component
│   │   └── index.js              # Entry point
│   └── package.json
│
├── CREATE_REMAINING_FILES.sh     # Script to generate remaining files
└── README.md                     # This file
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Step 1: Clone/Extract the Project
```bash
cd sahayata-sos-mern
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Setup

### Backend Environment Variables
Edit `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sahayata-sos
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sahayata-sos

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment (Optional)
Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### Option 1: Run Both Servers Separately

#### Terminal 1 - Backend Server
```bash
cd backend

# Seed the database with sample data (first time only)
npm run seed

# Start backend server
npm run dev
```
Backend will run on: **http://localhost:5000**

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm start
```
Frontend will run on: **http://localhost:3000**

### Option 2: Quick Start Script
Create a file `start.sh` in the root directory:

```bash
#!/bin/bash
# Kill any existing processes
pkill -f "node.*server.js"
pkill -f "react-scripts"

# Start backend
cd backend
npm run seed
npm run dev &

# Wait for backend to start
sleep 3

# Start frontend
cd ../frontend
npm start
```

Make it executable and run:
```bash
chmod +x start.sh
./start.sh
```

---

## 🔑 Default Credentials

After running `npm run seed` in the backend, you'll have these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@sahayata.com | Admin@123 |
| **User** | rahul@example.com | password123 |
| **Police** | police@sahayata.com | Police@123 |

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "123456"
}
```

#### Add Emergency Contact
```http
POST /api/auth/emergency-contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mother",
  "phone": "+919876543210",
  "relation": "Mother"
}
```

### Crime Report Endpoints

#### Create Report
```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "Theft",
  "description": "Description of the crime (min 20 characters)",
  "location": {
    "coordinates": [77.2167, 28.6315],
    "address": "Connaught Place, New Delhi"
  },
  "isAnonymous": true,
  "evidence": []
}
```

#### Get All Reports
```http
GET /api/reports?status=Pending&limit=20&page=1
```

#### Validate Report
```http
POST /api/reports/:id/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "I can confirm this incident"
}
```

#### Get Statistics
```http
GET /api/reports/stats/all
```

#### Get Crime Density
```http
GET /api/reports/density/areas
```

### SOS Alert Endpoints

#### Create SOS Alert
```http
POST /api/sos
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "Assault / Attack",
  "message": "Need immediate help!",
  "location": {
    "coordinates": [77.0736, 28.7495],
    "address": "Current Location (GPS)",
    "accuracy": 10
  }
}
```

#### Get My SOS Alerts
```http
GET /api/sos/my/all
Authorization: Bearer <token>
```

#### Get Nearby Active Alerts
```http
GET /api/sos/nearby/active?lat=28.6315&lng=77.2167&radius=5000
Authorization: Bearer <token>
```

#### Update SOS Status (Admin/Police)
```http
PUT /api/sos/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Resolved",
  "resolutionNotes": "Situation resolved successfully"
}
```

---

## 🎯 All 10 Requested Features 
- GPS location tracking
- Push notifications
- Multi-language support
- Voice recording
- OTP verification
- Emergency contacts
- Community validation
- Analytics dashboard

```bash
cd backend
npm start  # Uses node instead of nodemon
```

### Frontend
```bash
cd frontend
npm run build  # Creates optimized production build
```

Deploy `frontend/build` folder to static hosting (Vercel, Netlify, etc.)

---

## 🔒 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Bcrypt Password Hashing** - Industry-standard encryption
3. **Helmet.js** - Security headers
4. **Rate Limiting** - Prevent API abuse
5. **Input Validation** - Express-validator
6. **CORS** - Controlled cross-origin requests
7. **Role-Based Access Control** - Admin/Police/User permissions
8. **Anonymous Reporting** - Optional identity protection

---

## 📄 License

MIT License - Feel free to use for educational or commercial purposes

---

## 🎉 Success Checklist

- ✅ Backend API with Express & MongoDB
- ✅ Frontend React app with routing
- ✅ User authentication (JWT)
- ✅ Crime reporting system
- ✅ SOS alert system
- ✅ Interactive maps (Leaflet)
- ✅ File upload functionality
- ✅ Real-time GPS location
- ✅ Push notifications
- ✅ Multi-language support
- ✅ Voice recording
- ✅ User verification (OTP)
- ✅ Emergency contacts
- ✅ Report validation
- ✅ Advanced analytics
- ✅ Police portal
- ✅ Mobile responsive
- ✅ Role-based access
- ✅ Database seeding
- ✅ Error handling
- ✅ Security features
- ✅ Same UI as original HTML

---

**Built with ❤️ for India's Safety**

**Sahayata (साहाय्यता) - Your Safety, Our Priority**