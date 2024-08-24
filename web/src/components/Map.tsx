import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { fetchMarkersData } from '../utils/markerService';
import { MarkerData, EvacuationMarkerData, AEDMarkerData } from '../types/markerTypes';
import markerDanger from '../assets/markerDanger.png';
import evacuationIcon from '../assets/markerIcons/evacuationIcon.png';
import aedIcon from '../assets/markerIcons/AEDIcon.png';
import MapInfoWindow from './MapInfoWindow';
import EvacuationInfoWindow from './EvacuationInfoWindow'; 
import AEDInfoWindow from './AEDInfoWindow';
import { containerStyle, center } from '../utils/mapStyles';
import CommentsPanel from './CommentsPanel';
import evacuationData from '../assets/evacuationData.json';
import aedData from '../assets/AEDData.json';

function Map() {
  const [firebaseMarkers, setFirebaseMarkers] = useState<MarkerData[]>([]);
  const [evacuationMarkers, setEvacuationMarkers] = useState<EvacuationMarkerData[]>([]);
  const [aedMarkers, setAedMarkers] = useState<AEDMarkerData[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | EvacuationMarkerData | AEDMarkerData | null>(null);

  const updateSelectedMarker = useCallback((updatedMarker: MarkerData | EvacuationMarkerData | AEDMarkerData) => {
    setSelectedMarker(updatedMarker);
  }, []);

  const handleMenuToggle = useCallback(() => {
    setIsMenuVisible((prev) => !prev);
  }, []);

  useEffect(() => {
    const loadMarkers = async () => {
      const markerList = await fetchMarkersData();
      setFirebaseMarkers(markerList);
    };
    loadMarkers();
  }, []);

  useEffect(() => {
    if (firebaseMarkers.length > 0) {
      const loadEvacuationMarkers = () => {
        const evacuationMarkerData: EvacuationMarkerData[] = evacuationData.map((data) => ({
          id: "1",
          title: data.避難所or施設名称,
          elvator1f: data.エレベーター有or避難スペースが１階 === "True",
          slope: data.スロープ等 === "True",
          brailleBlock: data.点字ブロック === "True",
          WheelchairToilet: data.車椅子使用者対応トイレ === "True",
          position: { lat: parseFloat(data.緯度), lng: parseFloat(data.経度) },
        }));
        setEvacuationMarkers(evacuationMarkerData);
      };
      loadEvacuationMarkers();
    }
  }, [firebaseMarkers]);

  useEffect(() => {
    if (evacuationMarkers.length > 0) {
      const loadAEDMarkers = () => {
        const aedMarkerData: AEDMarkerData[] = aedData.map((data) => ({
          id: "1",
          title: data.配置施設名,
          place: data.設置個所,
          position: { lat: parseFloat(data.緯度), lng: parseFloat(data.経度) },
        }));
        setAedMarkers(aedMarkerData);
      };
      loadAEDMarkers();
    }
  }, [evacuationMarkers]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    directionsService.current = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer();
    directionsRenderer.current.setMap(map);
  }, []);

  const handleMarkerClick = useCallback((marker: MarkerData | EvacuationMarkerData | AEDMarkerData) => {
    setSelectedMarker(marker);
  }, []);

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const handleDirectionsClick = useCallback(() => {
    if (directionsService.current && directionsRenderer.current && selectedMarker && map) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("え");
          const { latitude, longitude } = position.coords;
          const currentLocation = new window.google.maps.LatLng(latitude, longitude);
          const destination = new window.google.maps.LatLng(
            selectedMarker.position.lat,
            selectedMarker.position.lng
          );

          const request: google.maps.DirectionsRequest = {
            origin: currentLocation,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
          };

          directionsService.current!.route(request, (result, status) => {
            setLoading(false);

            if (status === google.maps.DirectionsStatus.OK) {
              directionsRenderer.current!.setDirections(result);
            } else {
              console.error('Directions request failed due to ' + status);
            }
          });
        },
        (error) => {
          setLoading(false);
          console.error('Error getting current location:', error);
        }
      );
    }
  }, [selectedMarker, map]);

  const renderedFirebaseMarkers = useMemo(() => (
    firebaseMarkers.map((marker) => (
      <Marker
        key={marker.id}
        position={marker.position}
        onClick={() => handleMarkerClick(marker)}
        icon={{
          url: markerDanger,
          scaledSize: new window.google.maps.Size(25, 25),
        }}
      >
        {selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && (
          <MapInfoWindow 
            selectedMarker={selectedMarker as MarkerData} 
            handleDirectionsClick={handleDirectionsClick} 
            handleCloseInfoWindow={handleCloseInfoWindow} 
            handleMenuToggle={handleMenuToggle}
            loading={loading} 
          />
        )}
        {isMenuVisible && selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && (
          <CommentsPanel 
            selectedMarker={selectedMarker} 
            handleMenuToggle={handleMenuToggle}
            updateSelectedMarker={updateSelectedMarker}
          />
        )}
      </Marker>
    ))
  ), [firebaseMarkers, selectedMarker, handleMarkerClick, handleDirectionsClick, handleCloseInfoWindow, handleMenuToggle, isMenuVisible]);

  const renderedEvacuationMarkers = useMemo(() => (
    evacuationMarkers.map((marker) => (
      <Marker
        key={marker.id}
        position={marker.position}
        onClick={() => handleMarkerClick(marker)}
        icon={{
          url: evacuationIcon,
          scaledSize: new window.google.maps.Size(25, 25),
        }}
      >
        {selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && selectedMarker.hasOwnProperty('elvator1f') && (
          <EvacuationInfoWindow 
            selectedMarker={selectedMarker as EvacuationMarkerData}
            handleDirectionsClick={handleDirectionsClick} 
            handleCloseInfoWindow={handleCloseInfoWindow} 
            handleMenuToggle={handleMenuToggle}
            loading={loading} 
          />
        )}
      </Marker>
    ))
  ), [evacuationMarkers, selectedMarker, handleMarkerClick, handleCloseInfoWindow, handleMenuToggle, loading]);

  const renderedAedMarkers = useMemo(() => (
    aedMarkers.map((marker) => (
      <Marker
        key={marker.id}
        position={marker.position}
        onClick={() => handleMarkerClick(marker)}
        icon={{
          url: aedIcon,
          scaledSize: new window.google.maps.Size(25, 25),
        }}
      >
        {selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && selectedMarker.hasOwnProperty('place') && (
          <AEDInfoWindow 
            selectedMarker={selectedMarker as AEDMarkerData}
            handleDirectionsClick={handleDirectionsClick} 
            handleCloseInfoWindow={handleCloseInfoWindow}
            handleMenuToggle={handleMenuToggle} 
            loading={loading} 
          />
        )}
      </Marker>
    ))
  ), [aedMarkers, selectedMarker, handleMarkerClick, handleCloseInfoWindow, handleMenuToggle, loading]);

  return (
    <div className="w-9/12 h-full">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={11}
          onLoad={handleMapLoad}
        >
          {/* {renderedFirebaseMarkers} */}
          {/* {renderedEvacuationMarkers} */}
          {renderedAedMarkers}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Map;
