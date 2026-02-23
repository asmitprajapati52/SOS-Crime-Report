import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './styles/index.css';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportCrime from './pages/ReportCrime';
import CrimeMap from './pages/CrimeMap';
import SOSButton from './components/SOSButton';

function App() {
  const { user, loading } = useAuth();

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0d16, #141b2e, #0a0d16)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner" style={{
            width: '60px',
            height: '60px',
            border: '6px solid rgba(255,255,255,0.2)',
            borderTopColor: '#ff2d4a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 2rem'
          }}></div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>Loading Sahayata SOS...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="mesh-bg"></div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/report-crime" element={user ? <ReportCrime /> : <Navigate to="/login" />} />
          <Route path="/crime-map" element={<CrimeMap />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <SOSButton />
      </div>
    </Router>
  );
}

export default App;
