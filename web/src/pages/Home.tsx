import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { fetchMarkersData } from '../utils/markerService';
import { MarkerData, EvacuationMarkerData, AEDMarkerData, HospitalMarkerData } from '../types/markerTypes';
import reportIcon from '../assets/markerIcons/reportIcon.png';
import evacuationIcon from '../assets/markerIcons/evacuationIcon.png';
import hospitalIcon from '../assets/markerIcons/hospitalIcon.png';
import aedIcon from '../assets/markerIcons/AEDIcon.png';
import MapInfoWindow from '../components/MapInfoWindow';
import EvacuationInfoWindow from '../components/EvacuationInfoWindow'; 
import AEDInfoWindow from '../components/AEDInfoWindow';
import HospitalInfoWindow from '../components/HospitalInfoWindow';
import { containerStyle, center } from '../utils/mapStyles';
import CommentsPanel from '../components/CommentsPanel';
import evacuationData from '../assets/evacuationData.json';
import aedData from '../assets/AEDData.json';
import hospitalData from '../assets/hospitalData.json';
import ReportModal from '../components/ReportModal';
import logo from '../assets/CRealLogo.jpg'; // 画像ファイルのパス
import { FaSpinner } from 'react-icons/fa';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAED, setShowAED] = useState(true);
  const [showEvacuation, setShowEvacuation] = useState(true);
  const [showHospital, setShowHospital] = useState(true);
  const [firebaseMarkers, setFirebaseMarkers] = useState<MarkerData[]>([]);
  const [evacuationMarkers, setEvacuationMarkers] = useState<EvacuationMarkerData[]>([]);
  const [aedMarkers, setAedMarkers] = useState<AEDMarkerData[]>([]);
  const [hospitalMarkers, setHospitalMarkers] = useState<HospitalMarkerData[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPathToEvacuation, setloadingPathToEvacuation] = useState(false);
  const [loadingPathToHospital, setloadingPathToHospital] = useState(false);
  const [loadingPathToAED, setloadingPathToAED] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | EvacuationMarkerData | AEDMarkerData | HospitalMarkerData | null>(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFilterChange = (type: 'aed' | 'evacuation' | 'hospital') => {
    if (type === 'aed') {
      setShowAED(!showAED);
    } else if (type === 'evacuation') {
      setShowEvacuation(!showEvacuation);
    }
    else if (type === 'hospital') {
      setShowHospital(!showHospital);
    }
  };

  const updateSelectedMarker = useCallback((updatedMarker: MarkerData | EvacuationMarkerData | AEDMarkerData | HospitalMarkerData) => {
    setSelectedMarker(updatedMarker);
  }, []);

  const handleMenuToggle = useCallback(() => {
    setIsMenuVisible((prev) => !prev);
  }, []);

  useEffect(() => {
    const loadMarkers = async () => {
      // Firebaseデータの読み込みとフィルタリング
      const markerList = await fetchMarkersData();
      const filteredMarkers = markerList.filter(marker => !marker.solved);
      setFirebaseMarkers(filteredMarkers);
  
      // 他のマーカーのデータを読み込む
      loadAEDMarkers();
      loadEvacuationMarkers();
      loadHospitalMarkers();
    };
  
    const loadAEDMarkers = () => {
      const aedMarkerData: AEDMarkerData[] = aedData.map((data) => ({
        id: "1",
        title: data.配置施設名,
        place: data.設置個所,
        position: { lat: parseFloat(data.緯度), lng: parseFloat(data.経度) },
      }));
      setAedMarkers(aedMarkerData);
    };
  
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
  
    const loadHospitalMarkers = () => {
      const hospitalMarkerData: HospitalMarkerData[] = hospitalData.map((data) => ({
        id: "1",
        title: data.施設名,
        phone: data.電話番号,
        numberOfBeds: parseInt(data.病床数),
        tertiaryEmergency: data.三次救急 == "True",
        position: { lat: parseFloat(data.Latitude), lng: parseFloat(data.Longitude) },
      }));
      setHospitalMarkers(hospitalMarkerData);
    };
  
    // 最初の処理を開始
    loadMarkers();
  }, []);
  

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
          url: reportIcon,
          scaledSize: new window.google.maps.Size(50, 50),
        }}
      >
        {selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && (
          <MapInfoWindow 
            selectedMarker={selectedMarker as MarkerData} 
            handleDirectionsClick={handleDirectionsClick} 
            handleCloseInfoWindow={handleCloseInfoWindow} 
            handleMenuToggle={handleMenuToggle}
            isMenuVisible={isMenuVisible}
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
    showEvacuation && evacuationMarkers.map((marker) => (
      <Marker
        key={marker.id}
        position={marker.position}
        onClick={() => handleMarkerClick(marker)}
        icon={{
          url: evacuationIcon,
          scaledSize: new window.google.maps.Size(35, 35),
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
  ), [evacuationMarkers, selectedMarker, handleMarkerClick, handleCloseInfoWindow, handleMenuToggle, loading, showEvacuation]);

  const renderedAedMarkers = useMemo(() => (
    showAED && aedMarkers.map((marker) => (
      <Marker
        key={marker.id}
        position={marker.position}
        onClick={() => handleMarkerClick(marker)}
        icon={{
          url: aedIcon,
          scaledSize: new window.google.maps.Size(35, 35),
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
  ), [aedMarkers, selectedMarker, handleMarkerClick, handleCloseInfoWindow, handleMenuToggle, loading, showAED]);


  const renderedHospitalMarkers = useMemo(() => (
    showHospital && hospitalMarkers.map((marker) => (
      <Marker
        key={marker.id}
        position={marker.position}
        onClick={() => handleMarkerClick(marker)}
        icon={{
          url: hospitalIcon,
          scaledSize: new window.google.maps.Size(35, 35),
        }}
      >
        {selectedMarker && 'id' in selectedMarker && selectedMarker.id === marker.id && selectedMarker.hasOwnProperty('phone') &&  (
          <HospitalInfoWindow 
            selectedMarker={selectedMarker as HospitalMarkerData}
            handleDirectionsClick={handleDirectionsClick} 
            handleCloseInfoWindow={handleCloseInfoWindow} 
            handleMenuToggle={handleMenuToggle}
            loading={loading} 
          />
        )}
      </Marker>
    ))
  ), [hospitalMarkers, selectedMarker, handleMarkerClick, handleCloseInfoWindow, handleMenuToggle, loading, showHospital]);

  const handleShowRoute = useCallback((mode: string) => {  
    if (mode === 'evacuation') {
      setloadingPathToEvacuation(true);
    } else if (mode === 'hospital') {
      setloadingPathToHospital(true);
    } else if (mode === 'aed') {
      setloadingPathToAED(true);
    }
  
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const currentLocation = new window.google.maps.LatLng(latitude, longitude);
  
      let nearestMarker = null;
      let minDistance = Infinity;
      const targetMarkers = mode === 'aed' ? aedMarkers :
                      mode === 'evacuation' ? evacuationMarkers :
                      mode === 'hospital' ? hospitalMarkers :
                      [];
  
      targetMarkers.forEach(marker => {
        const aedLocation = new window.google.maps.LatLng(marker.position.lat, marker.position.lng);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(currentLocation, aedLocation);
  
        if (distance < minDistance) {
          minDistance = distance;
          nearestMarker = marker;
        }
      });
  
      if (nearestMarker) {
        setSelectedMarker(nearestMarker);
      }
  
      if (mode === 'evacuation') {
        setloadingPathToEvacuation(false);
      } else if (mode === 'hospital') {
        setloadingPathToHospital(false);
      } else if (mode === 'aed') {
        setloadingPathToAED(false);
      }

    }, (error) => {
      console.error('Error getting current location:', error);
      if (mode === 'evacuation') {
        setloadingPathToEvacuation(false);
      } else if (mode === 'hospital') {
        setloadingPathToHospital(false);
      } else if (mode === 'aed') {
        setloadingPathToAED(false);
      }
    });
  }, [aedMarkers, evacuationMarkers, hospitalMarkers, handleDirectionsClick]);
  

  return (
    <div className="flex h-screen w-screen">
      <div className="w-3/12 bg-gray-100 p-4 text-black">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="サービスのロゴ" className="w-32 h-auto" />
        </div>
        <button
          onClick={openModal}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
        >
          被害状況を報告
        </button>
        <div className="mt-4">
          <button
            onClick={() => handleFilterChange('aed')}
            className={`w-full px-4 py-2 rounded ${showAED ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
          >
            {showAED ? 'AEDを非表示にする' : 'AEDを表示する'}
          </button>
          <button
            onClick={() => handleFilterChange('evacuation')}
            className={`w-full mt-2 px-4 py-2 rounded ${showEvacuation ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
          >
            {showEvacuation ? '避難所を非表示にする' : '避難所を表示する'}
          </button>
          <button
            onClick={() => handleFilterChange('hospital')}
            className={`w-full mt-2 px-4 py-2 rounded ${showHospital ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
          >
            {showHospital ? '病院を非表示にする' : '病院を表示する'}
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={() => handleShowRoute('evacuation')}
            className={`w-full mt-2 text-white px-4 py-2 rounded flex items-center justify-center ${loadingPathToEvacuation ? 'bg-orange-500' : 'bg-green-500'}`}
            disabled={loading || loadingPathToEvacuation || loadingPathToHospital || loadingPathToAED}
          >
            {loadingPathToEvacuation ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                ルート検索中
              </>
            ) : (
              '一番近くの避難所を表示'
            )}
          </button>
          <button
            onClick={() => handleShowRoute('hospital')}
            className={`w-full mt-2 text-white px-4 py-2 rounded flex items-center justify-center ${loadingPathToHospital ? 'bg-orange-500' : 'bg-green-500'}`}
            disabled={loading || loadingPathToEvacuation || loadingPathToHospital || loadingPathToAED}
          >
            {loadingPathToHospital ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                ルート検索中
              </>
            ) : (
              '一番近くの病院を表示'
            )}
          </button>
          <button
            onClick={() => handleShowRoute('aed')}
            className={`w-full mt-2 text-white px-4 py-2 rounded flex items-center justify-center ${loadingPathToAED ? 'bg-orange-500' : 'bg-green-500'}`}
            disabled={loading || loadingPathToEvacuation || loadingPathToHospital || loadingPathToAED}
          >
            {loadingPathToAED ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                ルート検索中
              </>
            ) : (
              '一番近くのAEDを表示'
            )}
          </button>
        </div>
        <div className="mt-4 text-gray-700">
          <h2 className="text-xl font-bold">東京都の災害対策資料のご案内</h2>
          <a href="https://www.bousai.metro.tokyo.lg.jp/content/e_book_03/guide-japanese/pdf/guide-janapese.pdf" target="_blank" rel="noopener noreferrer">
            東京都防災ガイドブック
          </a>
          <p>東京都内での防災対策や避難方法、必要な準備についてまとめられたガイドです。</p>
          <a href="https://www.bousai.metro.tokyo.lg.jp/_res/projects/default_project/_page_/001/008/041/04_pdf.pdf" target="_blank" rel="noopener noreferrer">
            もしもマニュアル
          </a>
          <p>東京都の防災への取り組みを共有し、災害時の備えと対応を詳細に解説する実践的ガイドです。</p>
          <a href="https://www.sangyo-rodo.metro.tokyo.lg.jp/tourism/saigai_manual_R1Ver.pdf" target="_blank" rel="noopener noreferrer">
            災害時初動対応マニュアル
          </a>
          <p>特に外国人旅行者に対して、災害時の初動対応の手順を示し安全確保を目的としたガイドです。</p>
          <a href="https://www.bousai.metro.tokyo.lg.jp/bousai/1000026/1000288.html" target="_blank" rel="noopener noreferrer">
            応急手当
          </a>
          <p>応急手当の基本的な方法や、怪我や病気の応急処置についての情報が提供されています。</p>
        </div>
      </div>
      <div className="w-9/12 h-full">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={11}
          onLoad={handleMapLoad}
        >
          {renderedFirebaseMarkers}
          {renderedEvacuationMarkers}
          {renderedAedMarkers}
          {renderedHospitalMarkers}
        </GoogleMap>
      </LoadScript>
    </div>
      {isModalOpen && (
        <ReportModal isOpen={isModalOpen} onClose={closeModal} />
      )}
    </div>
  );
}

export default Home;
