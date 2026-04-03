import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const STATUS_COLORS = {
  pending: '#4A9EE8',
  in_transit: '#E8A020',
  out_for_delivery: '#F59E0B',
  delivered: '#3DB87A',
  exception: '#E24B4A',
  returned: '#8B5CF6',
};

export default function MapView({ events = [], shipment }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // If no mapbox token, show a placeholder
    if (!mapboxgl.accessToken || mapboxgl.accessToken === '') {
      mapRef.current.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--surface2);color:var(--text-dim);font-size:0.85rem;flex-direction:column;gap:8px;">
          <div style="font-size:2rem;">🗺️</div>
          <div>Add VITE_MAPBOX_TOKEN to enable the live map</div>
          <a href="https://account.mapbox.com" target="_blank" style="color:var(--brand);font-size:0.78rem;">Get a free token →</a>
        </div>`;
      return;
    }

    const eventsWithCoords = events.filter(e => e.latitude && e.longitude);
    if (!eventsWithCoords.length) {
      mapRef.current.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--surface2);color:var(--text-dim);font-size:0.85rem;">
          No location data available yet
        </div>`;
      return;
    }

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [eventsWithCoords[eventsWithCoords.length - 1].longitude, eventsWithCoords[eventsWithCoords.length - 1].latitude],
      zoom: 3,
      attributionControl: false,
    });

    mapInstance.current = map;

    map.on('load', () => {
      const coordinates = eventsWithCoords.map(e => [e.longitude, e.latitude]);

      // Draw route line
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates },
        },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#E8A020',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.8,
        },
      });

      // Add markers for each event
      eventsWithCoords.forEach((event, i) => {
        const isLatest = i === eventsWithCoords.length - 1;
        const isFirst = i === 0;

        const el = document.createElement('div');
        el.style.cssText = `
          width: ${isLatest ? 20 : 10}px;
          height: ${isLatest ? 20 : 10}px;
          border-radius: 50%;
          background: ${isLatest ? STATUS_COLORS[event.status] || '#E8A020' : isFirst ? '#4A9EE8' : 'rgba(232,160,32,0.5)'};
          border: 2px solid ${isLatest ? 'white' : 'rgba(255,255,255,0.3)'};
          box-shadow: ${isLatest ? '0 0 0 4px rgba(232,160,32,0.3)' : 'none'};
          cursor: pointer;
        `;

        if (isLatest) {
          el.style.animation = 'pulse-marker 2s ease-in-out infinite';
        }

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
            <div style="font-family:Syne,sans-serif;font-size:12px;padding:4px;">
              <div style="font-weight:700;margin-bottom:2px;">${event.location || event.city || 'Unknown location'}</div>
              <div style="color:#888;margin-bottom:2px;">${event.description}</div>
              <div style="color:#888;font-size:10px;">${new Date(event.occurred_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([event.longitude, event.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Fit map to show all points
      if (coordinates.length > 1) {
        const bounds = coordinates.reduce(
          (b, coord) => b.extend(coord),
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );
        map.fitBounds(bounds, { padding: 80, maxZoom: 6 });
      }
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, [events]);

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        @keyframes pulse-marker {
          0%, 100% { box-shadow: 0 0 0 4px rgba(232,160,32,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(232,160,32,0.1); }
        }
        .mapboxgl-popup-content {
          background: #1E2022 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
          color: #F2EFE8 !important;
          padding: 10px 14px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4) !important;
        }
        .mapboxgl-popup-tip { border-top-color: #1E2022 !important; }
      `}</style>
      <div ref={mapRef} style={{ height: 380, borderRadius: '0 0 14px 14px' }} />
    </div>
  );
}
