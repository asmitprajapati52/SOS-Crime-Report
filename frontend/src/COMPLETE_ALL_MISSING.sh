#!/bin/bash
echo "Fixing ALL 7 missing items..."

# 1. Add missing CSS animations to index.css
cat >> styles/index.css << 'EOFCSS'

/* MISSING ANIMATIONS - ADDED NOW */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

@keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
}

.animate-float { animation: float 6s ease-in-out infinite; }
EOFCSS

echo "✅ 1. Added missing CSS animations"

# 2. Fix ReportCrime to add custom type toggle
cat > pages/ReportCrime_FIXED.js << 'EOFREPORT'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../utils/api';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';
import VoiceRecorder from '../components/VoiceRecorder';

const ReportCrime = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    customType: '',
    description: '',
    location: { address: '' },
    isAnonymous: true
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get final crime type
    const finalType = formData.type === 'custom' ? formData.customType : formData.type;
    
    if (!finalType || !formData.description || !formData.location.address) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.type === 'custom' && !formData.customType.trim()) {
      toast.error('Please enter custom crime type');
      return;
    }

    if (formData.description.length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const data = {
          type: finalType,
          description: formData.description,
          location: {
            coordinates: [position.coords.longitude, position.coords.latitude],
            address: formData.location.address
          },
          isAnonymous: formData.isAnonymous
        };

        const res = await reportAPI.create(data);
        toast.success(`✅ Report ${res.data.data.reportId} submitted!`);
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to submit report');
      } finally {
        setLoading(false);
      }
    }, () => {
      toast.error('Please enable location access');
      setLoading(false);
    });
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>📝 Report Crime</h2>
            <button onClick={() => navigate('/dashboard')} className="btn-outline">← Back</button>
          </div>

          <div style={{ background: 'rgba(43,165,255,0.1)', border: '1px solid rgba(43,165,255,0.3)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.875rem' }}>🔒 <strong>100% Anonymous:</strong> Your identity is protected with SHA-256 encryption.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Crime Type *</label>
              <select 
                className="input-field" 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={loading}
              >
                <option value="">Select type</option>
                <option value="Theft">Theft</option>
                <option value="Assault">Assault</option>
                <option value="Robbery">Robbery</option>
                <option value="Harassment">Harassment</option>
                <option value="Vandalism">Vandalism</option>
                <option value="Fraud">Fraud</option>
                <option value="Burglary">Burglary</option>
                <option value="custom">➕ Other (Type Custom)</option>
              </select>
              {formData.type === 'custom' && (
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type your crime type..."
                  value={formData.customType}
                  onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                  disabled={loading}
                  style={{ marginTop: '0.5rem' }}
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description *</label>
              <textarea
                className="input-field"
                rows="5"
                placeholder="Describe what happened in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              />
              <p style={{ fontSize: '0.875rem', opacity: 0.6, marginTop: '0.5rem' }}>Minimum 20 characters</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Area, City, State"
                value={formData.location.address}
                onChange={(e) => setFormData({ ...formData, location: { address: e.target.value } })}
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Evidence (Optional)</label>
              <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1rem' }}>
                Upload photos, videos, or audio recordings as proof
              </p>
              <FileUpload onFilesChange={setFiles} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Voice Recording (Optional)</label>
              <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1rem' }}>
                Record audio evidence or description
              </p>
              <VoiceRecorder onRecordingComplete={(file) => setFiles([...files, { file, preview: URL.createObjectURL(file) }])} />
            </div>

            <button type="submit" className="btn-neon" style={{ width: '100%', fontSize: '1.125rem' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Anonymous Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportCrime;
EOFREPORT

mv pages/ReportCrime_FIXED.js pages/ReportCrime.js
echo "✅ 2. Added custom type toggle to ReportCrime"

# Will continue with remaining fixes...
echo "
════════════════════════════════════
  Partial fixes applied!
  Now creating remaining components...
════════════════════════════════════
"
