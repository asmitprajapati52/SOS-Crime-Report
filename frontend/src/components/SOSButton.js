import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { sosAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SOSButton = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('Assault / Attack');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSOS = async () => {
    if (!type) {
      toast.error('Please select emergency type');
      return;
    }

    setSubmitting(true);
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const data = {
          type,
          message,
          location: {
            coordinates: [position.coords.longitude, position.coords.latitude],
            address: 'Current Location (GPS)',
            accuracy: position.coords.accuracy
          }
        };

        const res = await sosAPI.create(data);
        toast.success(`🚨 SOS Alert Sent! ${res.data.data.totalNotified} entities notified`);
        setShowModal(false);
        setType('Assault / Attack');
        setMessage('');
        
        // Show success modal
        setTimeout(() => {
          toast.info('📡 Police, NGOs, and nearby users have been notified!', { autoClose: 5000 });
        }, 1000);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send SOS alert');
      } finally {
        setSubmitting(false);
      }
    }, (error) => {
      toast.error('Please enable location access');
      setSubmitting(false);
    });
  };

  return (
    <>
      <button className="sos-button" onClick={() => setShowModal(true)}>
        <span style={{ fontSize: '2rem', animation: 'pulse 2s infinite' }}>⚠️</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>SOS</span>
      </button>

      {showModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && setShowModal(false)}>
          <div className="modal-content">
            <div style={{ background: 'linear-gradient(135deg,#ff2d4a,#ed1136)', padding: '1.5rem', borderRadius: '1.5rem 1.5rem 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>⚠️</span>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Emergency SOS Alert</h2>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '2.5rem', height: '2.5rem', borderRadius: '50%', cursor: 'pointer', fontSize: '1.25rem' }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ background: 'rgba(251,191,36,0.1)', borderLeft: '4px solid #fbbf24', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem' }}>Your location will be shared with nearby verified users, police, NGOs, and media.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Emergency Type *</label>
                  <select 
                    className="input-field" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    disabled={submitting}
                  >
                    <option>Assault / Attack</option>
                    <option>Robbery</option>
                    <option>Stalking / Harassment</option>
                    <option>Medical Emergency</option>
                    <option>Fire</option>
                    <option>Accident</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Additional Info (Optional)</label>
                  <textarea
                    className="input-field"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Brief description..."
                    rows="3"
                    disabled={submitting}
                  />
                </div>

                <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid #ef4444', padding: '1rem', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Anti-Misuse Warning</p>
                  <ul style={{ fontSize: '0.875rem', paddingLeft: '1.5rem' }}>
                    <li>3 fake alerts = 7-day ban</li>
                    <li>5 fake alerts = Permanent ban</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setShowModal(false)} 
                    style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSOS} 
                    className="btn-neon" 
                    style={{ flex: 1 }}
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send SOS Alert'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
