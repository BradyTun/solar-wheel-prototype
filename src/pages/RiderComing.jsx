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

function CountdownTimer({ hours }) {
    const [timeLeft, setTimeLeft] = useState(hours * 3600);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [hours]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    return <div>{formatTime(timeLeft)}</div>;
}

function RiderComing() {
    const navigate = useNavigate();
    const locationState = useLocation()?.state || {};
    // Use the static coordinate as the default user location
    const userCoords = locationState.userCoords && locationState.userCoords.length === 2 ? locationState.userCoords : [21.8867023, 96.0607179];
    const riderStart = locationState.riderCoords && locationState.riderCoords.length === 2 ? locationState.riderCoords : [userCoords[0] - 0.01, userCoords[1] + 0.01];
    const [timer, setTimer] = useState(5);
    const [riderPosition, setRiderPosition] = useState(riderStart);
    const [showArrivalPopup, setShowArrivalPopup] = useState(false);
    const [arrived, setArrived] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    if(!arrived){
                        clearInterval(interval);
                        setShowArrivalPopup(true);
                        setArrived(true)
                    }
                    return 0;
                }
                const newTimer = prevTimer - 1;
                // Linear interpolation for rider movement
                const fraction = (5 - newTimer) / 5;
                const newLat = riderStart[0] + fraction * (userCoords[0] - riderStart[0]);
                const newLng = riderStart[1] + fraction * (userCoords[1] - riderStart[1]);
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
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white bg-opacity-95 rounded-t-lg shadow-xl z-[99999]">
                {timer === 0 ? (
                    <>
                        <p className="text-gray-600 mb-4">
                            Rider will collect the battery again in 4 hours.
                        </p>
                        <CountdownTimer hours={4} />
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-md shadow-md focus:outline-none"
                        >
                            Restart the Prototype
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col items-center">
                            <span className="text-6xl mb-2">🚴</span>
                            <h2 className="text-2xl font-bold text-gray-900">A <b>solar rider</b>is on the way!</h2>
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
                    </>
                )}
            </div>
            {/* Arrival popup */}
            {showArrivalPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/20 bg-opacity-50 z-[100000]">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4">Rider has arrived!</h2>
                        <p className="text-gray-600 mb-4">
                            Rider will collect the battery again in 4 hours.
                        </p>
                        <CountdownTimer hours={4} />
                        <button
                            onClick={() => {
                                setShowArrivalPopup(false);
                            }}
                            className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow-md focus:outline-none"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RiderComing;
