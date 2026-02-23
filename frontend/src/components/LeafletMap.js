import React, { useEffect, useRef } from 'react';

const LeafletMap = ({ reports = [], sosAlerts = [], density = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Check if Leaflet is available
    if (typeof window === 'undefined' || !window.L) {
      console.warn('Leaflet not loaded. Install with: npm install leaflet react-leaflet');
      return;
    }

    const L = window.L;

    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [28.6139, 77.2090],
        zoom: 11,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
      }).addTo(mapInstanceRef.current);

      // Add risk zone circles
      density.forEach(area => {
        const color = area.risk === 'high' ? '#ef4444' : area.risk === 'medium' ? '#fbbf24' : '#22c55e';
        const marker = area.risk === 'high' ? '🔴' : area.risk === 'medium' ? '🟡' : '🟢';

        // Circle
        L.circle([area.lat, area.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.25,
          radius: 2500,
          weight: 4
        }).addTo(mapInstanceRef.current);

        // Center marker
        const icon = L.divIcon({
          html: `<div style="font-size:2rem;">${marker}</div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        L.marker([area.lat, area.lng], { icon }).addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="color:#000;min-width:200px;">
              <strong style="font-size:1.2rem;">${area.name}</strong><br>
              <strong>Risk:</strong> <span style="color:${color};">${area.risk.toUpperCase()}</span><br>
              <strong>Reports:</strong> ${area.count}
            </div>
          `);
      });

      // Add crime markers
      reports.slice(0, 20).forEach(report => {
        if (report.location?.coordinates) {
          const [lng, lat] = report.location.coordinates;
          const icon = L.divIcon({
            html: '<div style="font-size:28px;">📍</div>',
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          });

          L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="color:#000;min-width:180px;">
                <strong>${report.type}</strong><br>
                <strong>Status:</strong> ${report.status}<br>
                <strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}
              </div>
            `);
        }
      });

      // Add SOS markers
      sosAlerts.filter(a => a.status === 'Active').forEach(alert => {
        if (alert.location?.coordinates) {
          const [lng, lat] = alert.location.coordinates;
          const icon = L.divIcon({
            html: '<div style="font-size:36px;animation:pulse 2s infinite;">🚨</div>',
            className: '',
            iconSize: [45, 45],
            iconAnchor: [22, 45]
          });

          L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current)
            .bindPopup(`
              <div style="color:#000;min-width:180px;">
                <strong style="color:#ef4444;">ACTIVE SOS</strong><br>
                <strong>Type:</strong> ${alert.type}<br>
                <strong>Time:</strong> ${alert.timeElapsed || 'Just now'}
              </div>
            `);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reports, sosAlerts, density]);

  return (
    <div>
      <div ref={mapRef} style={{ height: '600px', borderRadius: '1.5rem', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}></div>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', opacity: 0.7, textAlign: 'center' }}>
        ℹ️ If map doesn't load: <code>npm install leaflet</code> and add Leaflet CSS to index.html
      </p>
    </div>
  );
};

export default LeafletMap;
