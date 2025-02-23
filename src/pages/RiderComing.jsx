import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issues with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Define a custom rider icon using the 🚴 emoji
const riderIcon = L.divIcon({
  html: '<span style="font-size: 2rem;">🚴</span>',
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function RiderComing() {
  const navigate = useNavigate();
  const locationState = useLocation().state || {};
  const userCoords = locationState.userCoords || [51.505, -0.09];
  const riderStart = locationState.riderCoords || [51.515, -0.1];
  const [timer, setTimer] = useState(5);
  const [riderPosition, setRiderPosition] = useState(riderStart);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        const newTimer = prevTimer - 1;
        // Linear interpolation for rider movement
        const fraction = (5 - newTimer) / 5;
        const newLat = riderStart[0] - fraction * (riderStart[0] - userCoords[0]);
        const newLng = riderStart[1] - fraction * (riderStart[1] - userCoords[1]);
        setRiderPosition([newLat, newLng]);
        return newTimer;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [riderStart, userCoords]);

  return (
    <div className="relative w-full h-screen">
      {/* Fullscreen minimalistic map */}
      <MapContainer
        center={userCoords}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; <a href='https://carto.com/attributions'>CARTO</a>"
        />
        <Marker position={userCoords}>
          <Popup>Your Location</Popup>
        </Marker>
        <Marker position={riderPosition} icon={riderIcon}>
          <Popup>Rider's Current Position</Popup>
        </Marker>
        <Polyline positions={[riderPosition, userCoords]} color="#FFBF00" dashArray="8, 8" />
      </MapContainer>
      {/* Fixed overlay for rider details */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white bg-opacity-95 rounded-t-lg shadow-xl z-50">
        <div className="flex flex-col items-center">
          <span className="text-6xl mb-2">🚴</span>
          <h2 className="text-2xl font-bold text-gray-900">Rider is on the way!</h2>
          <p className="text-gray-600">
            Estimated arrival in {timer} second{timer !== 1 && 's'}.
          </p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/call-rider')}
            className="w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-md shadow-md focus:outline-none"
          >
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default RiderComing;
