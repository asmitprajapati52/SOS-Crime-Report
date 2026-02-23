import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success('✅ Login Successful!');
      setTimeout(() => {
        navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Welcome Back</h2>
            <p style={{ opacity: 0.7 }}>Login to Sahayata SOS</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div style={{ background: 'rgba(43,165,255,0.1)', border: '1px solid rgba(43,165,255,0.3)', padding: '1rem', borderRadius: '0.75rem' }}>
              <p style={{ fontSize: '0.875rem' }}>💡 <strong>Demo Accounts:</strong><br />
                Admin: admin@sahayata.com / Admin@123<br />
                User: rahul@example.com / password123<br />
                Police: police@sahayata.com / Police@123
              </p>
            </div>
            <button type="submit" className="btn-neon" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', opacity: 0.7 }}>
            Don't have an account? <button onClick={() => navigate('/register')} style={{ color: '#ff2d4a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Sign Up</button>
          </p>
          <button onClick={() => navigate('/')} className="btn-outline" style={{ width: '100%', marginTop: '1rem' }}>← Back</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
