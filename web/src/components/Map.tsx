import { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { fetchMarkersData } from '../utils/markerService';
import { MarkerData } from '../types/markerTypes';
import markerDanger from '../assets/markerDanger.png';
import MapInfoWindow from './MapInfoWindow';
import { containerStyle, center } from '../utils/mapStyles';
import CommentsPanel from './CommentsPanel';

function Map() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false); // 新しく追加

  const [selectedMarker, setSelectedMarker] = useState<MarkerData>({
    id: '1', // 例としてIDを設定
    title: 'Marker Title',
    description: 'Marker Description',
    position: { lat: 0, lng: 0 },
    comments: [] // 初期コメント
  });

  const updateSelectedMarker = (updatedMarker: MarkerData) => {
    setSelectedMarker(updatedMarker);
  };

  const handleMenuToggle = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  useEffect(() => {
    const loadMarkers = async () => {
      const markerList = await fetchMarkersData();
      setMarkers(markerList);
    };
    loadMarkers();
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
      setLoading(true); // ルート検索中に設定

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

          directionsService.current!.route(request, (result, status) => {
            setLoading(false); // ルート検索終了後に設定

            if (status === google.maps.DirectionsStatus.OK) {
              directionsRenderer.current!.setDirections(result);
            } else {
              console.error('Directions request failed due to ' + status);
            }
          });
        },
        (error) => {
          setLoading(false); // エラー発生時にも設定
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
                url: markerDanger,
                scaledSize: new window.google.maps.Size(50, 50),
              }}
            >
              {selectedMarker && selectedMarker.id === marker.id && (
                <MapInfoWindow 
                  selectedMarker={selectedMarker} 
                  handleDirectionsClick={handleDirectionsClick} 
                  handleCloseInfoWindow={handleCloseInfoWindow} 
                  handleMenuToggle={handleMenuToggle}
                  loading={loading} // ここで loading プロパティを渡す
                />
              )}
              {isMenuVisible && selectedMarker && selectedMarker.id === marker.id && (
                <CommentsPanel 
                  selectedMarker={selectedMarker} 
                  handleMenuToggle={handleMenuToggle}
                  updateSelectedMarker={updateSelectedMarker}
                />
              )}
            </Marker>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Map;
