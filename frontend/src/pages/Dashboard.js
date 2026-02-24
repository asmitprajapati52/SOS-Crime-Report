import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportAPI } from '../utils/api';
import EmergencyContacts from '../components/EmergencyContacts';
import OTPModal from '../components/OTPModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loadUser } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [userStats, setUserStats] = useState({
    myReports: 0,
    validations: 0,
    sosAlerts: 0,
    reputation: 100
  });
  
    const loadUserStats = async () => {
    try {
      const reportsRes = await reportAPI.getMy();
      setUserStats(prev => ({
        ...prev,
        myReports: reportsRes.data.count || 0,
        validations: user?.validationsGiven || 0,
        sosAlerts: user?.sosAlertsTriggered || 0,
        reputation: user?.reputation || 100
      }));
    } catch (error) {
      console.error('Stats error:', error);
    }
  };


  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);


  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>👤 User Dashboard</h1>
            <p style={{ opacity: 0.7 }}>Welcome back, {user?.name}!</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/')} className="btn-outline">Home</button>
            <button onClick={logout} className="btn-outline">Logout</button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/report-crime')}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report Crime</h3>
            <p style={{ opacity: 0.7 }}>Submit anonymous report with evidence</p>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/crime-map')}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Crime Map</h3>
            <p style={{ opacity: 0.7 }}>View heat map with risk zones</p>
          </div>
        </div>

        {/* USER STATISTICS - MISSING SECTION ADDED */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Your Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { icon: '📝', label: 'My Reports', value: userStats.myReports },
            { icon: '👍', label: 'Validations', value: userStats.validations },
            { icon: '🚨', label: 'SOS Alerts', value: userStats.sosAlerts },
            { icon: '⭐', label: 'Reputation', value: `${userStats.reputation}%` }
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>{s.value}</div>
              <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {!user?.verified && (
          <div className="card" style={{ background: 'rgba(251,191,36,0.1)', border: '2px solid #fbbf24', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>⚠️ Verify Your Phone</h3>
                <p style={{ opacity: 0.8 }}>Verify your phone number to unlock all features</p>
              </div>
              <button onClick={() => setShowOTP(true)} className="btn-neon">Verify Now</button>
            </div>
          </div>
        )}
        
        <EmergencyContacts />

        <OTPModal show={showOTP} onClose={() => setShowOTP(false)} onVerified={() => loadUser()} />
      </div>
    </div>
  );
};

export default Dashboard;
