import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportAPI, sosAPI } from '../utils/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // styles first
const thStyle = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: "14px",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "14px",
};


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportsRes, sosRes, statsRes] = await Promise.all([
        reportAPI.getAll({ limit: 10 }),
        sosAPI.getAll({ limit: 10 }),
        reportAPI.getStats()
      ]);
      setReports(reportsRes.data.data);
      setSosAlerts(sosRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 900 }}>🛡️ Admin Control Panel</h1>
            <p style={{ opacity: 0.7, fontSize: '1.125rem' }}>Complete platform oversight</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/crime-map')} className="btn-outline">🗺️ Map</button>
            <button onClick={() => navigate('/')} className="btn-outline">Home</button>
            <button onClick={logout} className="btn-outline">Logout</button>
          </div>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{stats.totalReports}</div>
              <div style={{ opacity: 0.8 }}>Total Reports</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{stats.validationRate}</div>
              <div style={{ opacity: 0.8 }}>Validation Rate</div>
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: "2rem" }}>
  <h3
    style={{
      fontSize: "1.75rem",
      fontWeight: 700,
      marginBottom: "1.5rem",
    }}
  >
    📝 Recent Crime Reports
  </h3>

  <div style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "700px",
      }}
    >
      <thead
        style={{
          background: "#111827",
          color: "white",
        }}
      >
        <tr>
          <th style={thStyle}>Report ID</th>
          <th style={thStyle}>Type</th>
          <th style={thStyle}>Location</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Date</th>
        </tr>
      </thead>

      <tbody>
        {reports.map((r) => (
          <tr
            key={r._id}
            style={{
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <td style={tdStyle}>
              <code
                style={{
                  background: "#0f172a",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  color: "#38bdf8",
                }}
              >
                {r.reportId}
              </code>
            </td>

            <td style={tdStyle}>{r.type}</td>

            <td style={tdStyle}>{r.location?.address}</td>

            <td style={tdStyle}>
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background:
                    r.status === "Validated" ? "#dcfce7" : "#fef3c7",
                  color:
                    r.status === "Validated" ? "#166534" : "#92400e",
                }}
              >
                {r.status}
              </span>
            </td>

            <td style={tdStyle}>
              {new Date(r.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
<div className="card" style={{ marginTop: "2rem" }}>
  <h3
    style={{
      fontSize: "1.75rem",
      fontWeight: 700,
      marginBottom: "1.5rem",
    }}
  >
    🚨 SOS Alerts
  </h3>

  <div style={{ overflowX: "auto" }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "700px",
      }}
    >
      <thead
        style={{
          background: "#111827",
          color: "white",
        }}
      >
        <tr>
          <th style={thStyle}>Alert ID</th>
          <th style={thStyle}>Type</th>
          <th style={thStyle}>Location</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Notified</th>
        </tr>
      </thead>

      <tbody>
        {sosAlerts.map((a) => (
          <tr key={a._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
            <td style={tdStyle}>
              <code
                style={{
                  background: "#1f2937",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  color: "#ff4d6d",
                }}
              >
                {a.alertId}
              </code>
            </td>

            <td style={tdStyle}>{a.type}</td>

            <td style={tdStyle}>{a.location?.address}</td>

            <td style={tdStyle}>
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background:
                    a.status === "Active" ? "#fee2e2" : "#dcfce7",
                  color:
                    a.status === "Active" ? "#991b1b" : "#166534",
                }}
              >
                {a.status}
              </span>
            </td>

            <td style={tdStyle}>{a.totalNotified} entities</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
