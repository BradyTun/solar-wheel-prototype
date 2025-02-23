import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

function CallRider() {
    const navigate = useNavigate();
    const [locationInput, setLocationInput] = useState('');
    const [userCoords, setUserCoords] = useState(null);

    // Get user's current location
    useEffect(() => {
            setUserCoords([21.8861671,96.063105]); // fallback coordinates
    }, []);

    // Generate multiple rider coordinates around the user's location in a fixed pattern
    const generateRiderCoords = (userCoords) => {
        const offset = 0.01;
        return [
            [userCoords[0] + offset, userCoords[1] + offset],
            [userCoords[0] + offset * 2, userCoords[1] - offset * 2],
            [userCoords[0] - offset * 3, userCoords[1] + offset * 3],
            [userCoords[0] - offset * 4, userCoords[1] - offset * 4],
            [userCoords[0] + offset * 5, userCoords[1] - offset * 5],
        ];
    };

    const riderCoords = userCoords ? generateRiderCoords(userCoords) : [];

    const handleCall = (e) => {
        e.preventDefault();
        // Pass coordinates to the next page via state
        navigate('/rider-coming', { state: { userCoords, riderCoords } });
    };

    if (!userCoords) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-700">Fetching your location...</p>
            </div>
        );
    }

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
                {riderCoords.map((coords, index) => (
                    <Marker key={index} position={coords} icon={riderIcon}>
                        <Popup>Rider {index + 1}</Popup>
                    </Marker>
                ))}
            </MapContainer>
            {/* Fixed overlay panel for UI content */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white bg-opacity-95 rounded-t-lg shadow-xl z-[99999]">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Call Your Solar Rider 🚴
                    </h2>
                    <p className="text-gray-600">
                        We’ll deliver a one-time use power cell directly to your location.
                    </p>
                </div>
                <form onSubmit={handleCall} className="space-y-4">
                    <div>
                        <label htmlFor="location" className="block text-gray-700">
                            Your Location
                        </label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Enter your location (optional)"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        Call Rider
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CallRider;
