// import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// import { fetchMarkersData } from '../utils/markerService';
// import { MarkerData, EvacuationMarkerData, AEDMarkerData, HospitalMarkerData } from '../types/markerTypes';
// import reportIcon from '../assets/markerIcons/reportIcon.png';
// import evacuationIcon from '../assets/markerIcons/evacuationIcon.png';
// import hospitalIcon from '../assets/markerIcons/hospitalIcon.png';
// import aedIcon from '../assets/markerIcons/AEDIcon.png';
// import MapInfoWindow from './MapInfoWindow';
// import EvacuationInfoWindow from './EvacuationInfoWindow'; 
// import AEDInfoWindow from './AEDInfoWindow';
// import HospitalInfoWindow from './HospitalInfoWindow';
// import { containerStyle, center } from '../utils/mapStyles';
// import CommentsPanel from './CommentsPanel';
// import evacuationData from '../assets/evacuationData.json';
// import aedData from '../assets/AEDData.json';
// import hospitalData from '../assets/hospitalData.json';

// function Map({ showAED, showEvacuation, showHospital }: { showAED: boolean; showEvacuation: boolean, showHospital: boolean }) {
//   const [firebaseMarkers, setFirebaseMarkers] = useState<MarkerData[]>([]);
//   const [evacuationMarkers, setEvacuationMarkers] = useState<EvacuationMarkerData[]>([]);
//   const [aedMarkers, setAedMarkers] = useState<AEDMarkerData[]>([]);
//   const [hospitalMarkers, setHospitalMarkers] = useState<HospitalMarkerData[]>([]);
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const directionsService = useRef<google.maps.DirectionsService | null>(null);
//   const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
//   const [isMenuVisible, setIsMenuVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedMarker, setSelectedMarker] = useState<MarkerData | EvacuationMarkerData | AEDMarkerData | HospitalMarkerData | null>(null);

//   const updateSelectedMarker = useCallback((updatedMarker: MarkerData | EvacuationMarkerData | AEDMarkerData | HospitalMarkerData) => {
//     setSelectedMarker(updatedMarker);
//   }, []);

//   const handleMenuToggle = useCallback(() => {
//     setIsMenuVisible((prev) => !prev);
//   }, []);

//   useEffect(() => {
//     const loadMarkers = async () => {
//       // Firebaseデータの読み込みとフィルタリング
//       const markerList = await fetchMarkersData();
//       const filteredMarkers = markerList.filter(marker => !marker.solved);
//       setFirebaseMarkers(filteredMarkers);
  
//       // 他のマーカーのデータを読み込む
//       loadAEDMarkers();
//       loadEvacuationMarkers();
//       loadHospitalMarkers();
//     };
  
//     const loadAEDMarkers = () => {
//       const aedMarkerData: AEDMarkerData[] = aedData.map((data) => ({
//         id: "1",
//         title: data.配置施設名,
//         place: data.設置個所,
//         position: { lat: parseFloat(data.緯度), lng: parseFloat(data.経度) },
//       }));
//       setAedMarkers(aedMarkerData);
//     };
  
//     const loadEvacuationMarkers = () => {
//       const evacuationMarkerData: EvacuationMarkerData[] = evacuationData.map((data) => ({
//         id: "1",
//         title: data.避難所or施設名称,
//         elvator1f: data.エレベーター有or避難スペースが１階 === "True",
//         slope: data.スロープ等 === "True",
//         brailleBlock: data.点字ブロック === "True",
//         WheelchairToilet: data.車椅子使用者対応トイレ === "True",
//         position: { lat: parseFloat(data.緯度), lng: parseFloat(data.経度) },
//       }));
//       setEvacuationMarkers(evacuationMarkerData);
//     };
  
//     const loadHospitalMarkers = () => {
//       const hospitalMarkerData: HospitalMarkerData[] = hospitalData.map((data) => ({
//         id: "1",
//         title: data.施設名,
//         phone: data.電話番号,
//         numberOfBeds: parseInt(data.病床数),
//         tertiaryEmergency: data.三次救急 == "True",
//         position: { lat: parseFloat(data.Latitude), lng: parseFloat(data.Longitude) },
//       }));
//       setHospitalMarkers(hospitalMarkerData);
//     };
  
//     // 最初の処理を開始
//     loadMarkers();
//   }, []);
  

//   const handleMapLoad = useCallback((map: google.maps.Map) => {
//     setMap(map);
//     directionsService.current = new window.google.maps.DirectionsService();
//     directionsRenderer.current = new window.google.maps.DirectionsRenderer();
//     directionsRenderer.current.setMap(map);
//   }, []);

//   const handleMarkerClick = useCallback((marker: MarkerData | EvacuationMarkerData | AEDMarkerData) => {
//     setSelectedMarker(marker);
//   }, []);

//   const handleCloseInfoWindow = useCallback(() => {
//     setSelectedMarker(null);
//   }, []);

//   const handleDirectionsClick = useCallback(() => {
//     if (directionsService.current && directionsRenderer.current && selectedMarker && map) {
//       setLoading(true);
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           const currentLocation = new window.google.maps.LatLng(latitude, longitude);
//           const destination = new window.google.maps.LatLng(
//             selectedMarker.position.lat,
//             selectedMarker.position.lng
//           );

//           const request: google.maps.DirectionsRequest = {
//             origin: currentLocation,
//             destination: destination,
//             travelMode: google.maps.TravelMode.DRIVING,
//           };

//           directionsService.current!.route(request, (result, status) => {
//             setLoading(false);

//             if (status === google.maps.DirectionsStatus.OK) {
//               directionsRenderer.current!.setDirections(result);
//             } else {
//               console.error('Directions request failed due to ' + status);
//             }
//           });
//         },
//         (error) => {
//           setLoading(false);
//           console.error('Error getting current location:', error);
//         }
//       );
//     }
//   }, [selectedMarker, map]);

//   const renderedFirebaseMarkers = useMemo(() => (
//     firebaseMarkers.map((marker) => (
//       <Marker
//         key={marker.id}
//         position={marker.position}
//         onClick={() => handleMarkerClick(marker)}
//         icon={{
//           url: reportIcon,
//           scaledSize: new window.google.maps.Size(50, 50),
//         }}
//       >
//         {selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && (
//           <MapInfoWindow 
//             selectedMarker={selectedMarker as MarkerData} 
//             handleDirectionsClick={handleDirectionsClick} 
//             handleCloseInfoWindow={handleCloseInfoWindow} 
//             handleMenuToggle={handleMenuToggle}
//             loading={loading} 
//           />
//         )}
//         {isMenuVisible && selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && (
//           <CommentsPanel 
//             selectedMarker={selectedMarker} 
//             handleMenuToggle={handleMenuToggle}
//             updateSelectedMarker={updateSelectedMarker}
//           />
//         )}
//       </Marker>
//     ))
//   ), [firebaseMarkers, selectedMarker, handleMarkerClick, handleDirectionsClick, handleCloseInfoWindow, handleMenuToggle, isMenuVisible]);

//   const renderedEvacuationMarkers = useMemo(() => (
//     showEvacuation && evacuationMarkers.map((marker) => (
//       <Marker
//         key={marker.id}
//         position={marker.position}
//         onClick={() => handleMarkerClick(marker)}
//         icon={{
//           url: evacuationIcon,
//           scaledSize: new window.google.maps.Size(35, 35),
//         }}
//       >
//         {selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && selectedMarker.hasOwnProperty('elvator1f') && (
//           <EvacuationInfoWindow 
//             selectedMarker={selectedMarker as EvacuationMarkerData}
//             handleDirectionsClick={handleDirectionsClick} 
//             handleCloseInfoWindow={handleCloseInfoWindow} 
//             handleMenuToggle={handleMenuToggle}
//             loading={loading} 
//           />
//         )}
//       </Marker>
//     ))
//   ), [evacuationMarkers, selectedMarker, handleMarkerClick, handleCloseInfoWindow, handleMenuToggle, loading, showEvacuation]);

//   const renderedAedMarkers = useMemo(() => (
//     showAED && aedMarkers.map((marker) => (
//       <Marker
//         key={marker.id}
//         position={marker.position}
//         onClick={() => handleMarkerClick(marker)}
//         icon={{
//           url: aedIcon,
//           scaledSize: new window.google.maps.Size(35, 35),
//         }}
//       >
//         {selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && selectedMarker.hasOwnProperty('place') && (
//           <AEDInfoWindow 
//             selectedMarker={selectedMarker as AEDMarkerData}
//             handleDirectionsClick={handleDirectionsClick} 
//             handleCloseInfoWindow={handleCloseInfoWindow}
//             handleMenuToggle={handleMenuToggle} 
//             loading={loading} 
//           />
//         )}
//       </Marker>
//     ))
//   ), [aedMarkers, selectedMarker, handleMarkerClick, handleCloseInfoWindow, handleMenuToggle, loading, showAED]);


//   const renderedHospitalMarkers = useMemo(() => (
//     showHospital && hospitalMarkers.map((marker) => (
//       <Marker
//         key={marker.id}
//         position={marker.position}
//         onClick={() => handleMarkerClick(marker)}
//         icon={{
//           url: hospitalIcon,
//           scaledSize: new window.google.maps.Size(35, 35),
//         }}
//       >
//         {selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && selectedMarker.hasOwnProperty('phone') &&  (
//           <HospitalInfoWindow 
//             selectedMarker={selectedMarker as HospitalMarkerData}
//             handleDirectionsClick={handleDirectionsClick} 
//             handleCloseInfoWindow={handleCloseInfoWindow} 
//             handleMenuToggle={handleMenuToggle}
//             loading={loading} 
//           />
//         )}
//       </Marker>
//     ))
//   ), [hospitalMarkers, selectedMarker, handleMarkerClick, handleCloseInfoWindow, handleMenuToggle, loading, showHospital]);

//   const handleShowRoute = useCallback((markers: MarkerData[] | AEDMarkerData[] | EvacuationMarkerData[] | HospitalMarkerData[],  mode: string) => {
//     if (aedMarkers.length === 0) return;

//     navigator.geolocation.getCurrentPosition((position) => {
//       const { latitude, longitude } = position.coords;
//       const currentLocation = new window.google.maps.LatLng(latitude, longitude);

//       let nearestMarker = null;
//       let minDistance = Infinity;
//       const targetMarkers = mode === 'aed' ? aedMarkers :
//                       mode === 'evacuation' ? evacuationMarkers :
//                       mode === 'hospital' ? hospitalMarkers :
//                       [];

//       targetMarkers.forEach(marker => {
//         const aedLocation = new window.google.maps.LatLng(marker.position.lat, marker.position.lng);
//         const distance = google.maps.geometry.spherical.computeDistanceBetween(currentLocation, aedLocation);

//         if (distance < minDistance) {
//           minDistance = distance;
//           nearestMarker = marker;
//         }
//       });

//       if (nearestMarker) {
//         setSelectedMarker(nearestMarker);
//         handleDirectionsClick();
//       }
//     }, (error) => {
//       console.error('Error getting current location:', error);
//     });
//   }, [aedMarkers, handleDirectionsClick]);

//   return (
//     <div className="w-9/12 h-full">
//       <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
//         <GoogleMap
//           mapContainerStyle={containerStyle}
//           center={center}
//           zoom={11}
//           onLoad={handleMapLoad}
//         >
//           {renderedFirebaseMarkers}
//           {renderedEvacuationMarkers}
//           {renderedAedMarkers}
//           {renderedHospitalMarkers}
//         </GoogleMap>
//       </LoadScript>
//     </div>
//   );
// }

// export default Map;
