import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api';

const OTPModal = ({ show, onClose, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyOTP(otp);
      toast.success('✅ Phone verified successfully!');
      if (onVerified) onVerified();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await authAPI.resendOTP();
      toast.success('📱 OTP sent again');
      if (res.data.otp) {
        toast.info(`Development OTP: ${res.data.otp}`);
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" onClick={(e) => e.target.className === 'modal' && onClose()}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📱 Verify Phone</h2>
          <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
            Enter the 6-digit OTP sent to your phone
          </p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              disabled={loading}
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={onClose} className="btn-outline" style={{ flex: 1 }} disabled={loading}>
              Cancel
            </button>
            <button onClick={handleVerify} className="btn-neon" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <button 
            onClick={handleResend} 
            style={{ background: 'none', border: 'none', color: '#2ba5ff', cursor: 'pointer', width: '100%', padding: '0.5rem' }}
            disabled={loading}
          >
            Didn't receive OTP? Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
