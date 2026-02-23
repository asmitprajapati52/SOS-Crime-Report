import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('✅ Account Created!');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ opacity: 0.7 }}>Join Sahayata SOS today</p>
          </div>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Full Name</label>
              <input type="text" name="name" className="input-field" placeholder="Your Name" value={formData.name} onChange={handleChange} disabled={loading} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Email</label>
              <input type="email" name="email" className="input-field" placeholder="your@email.com" value={formData.email} onChange={handleChange} disabled={loading} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Phone</label>
              <input type="tel" name="phone" className="input-field" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} disabled={loading} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Password</label>
              <input type="password" name="password" className="input-field" placeholder="••••••••" value={formData.password} onChange={handleChange} disabled={loading} />
            </div>
            <button type="submit" className="btn-neon" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', opacity: 0.7 }}>
            Already have account? <button onClick={() => navigate('/login')} style={{ color: '#ff2d4a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Login</button>
          </p>
          <button onClick={() => navigate('/')} className="btn-outline" style={{ width: '100%', marginTop: '1rem' }}>← Back</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
