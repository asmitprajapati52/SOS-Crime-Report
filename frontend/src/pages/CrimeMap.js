import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI, sosAPI } from '../utils/api';
import { toast } from 'react-toastify';
import LeafletMap from '../components/LeafletMap';

const CrimeMap = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [density, setDensity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportsRes, densityRes] = await Promise.all([
        reportAPI.getAll({ limit: 50 }),
        reportAPI.getDensity()
      ]);
      setReports(reportsRes.data.data || []);
      setDensity(densityRes.data.data || []);
      
      // Try to load SOS alerts (may fail if not authorized)
      try {
        const sosRes = await sosAPI.getAll({ limit: 10 });
        setSosAlerts(sosRes.data.data || []);
      } catch (err) {
        console.log('SOS alerts not available (admin only)');
      }
    } catch (error) {
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>🗺️ Crime Heat Map</h1>
            <p style={{ opacity: 0.7 }}>Real-time crime density visualization</p>
          </div>
          <button onClick={() => navigate(-1)} className="btn-outline">← Back</button>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <p>Loading map data...</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>📊 Crime Statistics Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '1.5rem' }}>
                {density.map((area, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 600 }}>
                        {area.risk === 'high' ? '🔴' : area.risk === 'medium' ? '🟡' : '🟢'} {area.name}
                      </span>
                      <span style={{ fontWeight: 900, color: area.risk === 'high' ? '#ef4444' : area.risk === 'medium' ? '#fbbf24' : '#22c55e' }}>
                        {area.count} reports
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        background: area.risk === 'high' ? '#ef4444' : area.risk === 'medium' ? '#fbbf24' : '#22c55e',
                        height: '100%',
                        width: `${reports.length > 0 ? (area.count / reports.length) * 100 : 0}%`
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
              <LeafletMap reports={reports} sosAlerts={sosAlerts} density={density} />
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>🎯 Map Legend</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
                {[
                  { color: '#ef4444', label: 'High Risk Zone', desc: '3+ reports' },
                  { color: '#fbbf24', label: 'Medium Risk Zone', desc: '1-2 reports' },
                  { color: '#22c55e', label: 'Safe Zone', desc: 'No reports' },
                  { icon: '📍', label: 'Crime Report', desc: 'Click for details' },
                  { icon: '🚨', label: 'Active SOS', desc: 'Emergency in progress' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.color ? (
                      <div style={{ width: '30px', height: '20px', background: item.color, borderRadius: '0.25rem' }}></div>
                    ) : (
                      <div style={{ fontSize: '1.5rem' }}>{item.icon}</div>
                    )}
                    <div>
                      <strong>{item.label}</strong>
                      <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CrimeMap;
