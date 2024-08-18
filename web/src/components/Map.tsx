import { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 35.682839,
  lng: 139.759455
};

type MarkerData = {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description: string;
};

function Map() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    const fetchMarkers = async () => {
      const markersCollection = collection(db, 'markers');
      const markerSnapshot = await getDocs(markersCollection);
      const markerList: MarkerData[] = markerSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          position: {
            lat: data.position._lat,
            lng: data.position._long
          },
          title: data.title || '',
          description: data.description || ''
        };
      });
      setMarkers(markerList);
    };

    fetchMarkers();
  }, []);

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);
    directionsService.current = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer();
    directionsRenderer.current.setMap(map);
  };

  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(marker);
  };

  const handleCloseInfoWindow = () => {
    setSelectedMarker(null);
  };

  const handleDirectionsClick = () => {
    if (directionsService.current && directionsRenderer.current && selectedMarker && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = new window.google.maps.LatLng(latitude, longitude);
          const destination = new window.google.maps.LatLng(selectedMarker.position.lat, selectedMarker.position.lng);

          const request: google.maps.DirectionsRequest = {
            origin: currentLocation,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
          };

          directionsService.current.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsRenderer.current.setDirections(result);
            } else {
              console.error('Directions request failed due to ' + status);
            }
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  return (
    <div className="w-9/12 h-full">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!} libraries={['places', 'directions']}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={16}
          onLoad={handleMapLoad}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              onClick={() => handleMarkerClick(marker)}
              icon={{
                url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                scaledSize: new window.google.maps.Size(50, 50),
              }}
            >
              {selectedMarker && selectedMarker.id === marker.id && (
                <InfoWindow
                  position={marker.position}
                  onCloseClick={handleCloseInfoWindow}
                >
                  <div>
                    <h2 className="text-xl font-bold mb-2">{selectedMarker.title}</h2>
                    <p className="mb-4">{selectedMarker.description}</p>
                    <button
                      onClick={handleDirectionsClick}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      ここに向かう
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Map;
