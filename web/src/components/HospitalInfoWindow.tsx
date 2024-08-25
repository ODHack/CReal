// components/HospitalInfoWindow.tsx

import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { HospitalMarkerData } from '../types/markerTypes';
import { FaSpinner } from 'react-icons/fa';

interface HospitalInfoWindowProps {
  selectedMarker: HospitalMarkerData;
  handleDirectionsClick: () => void;
  handleCloseInfoWindow: () => void;
  handleMenuToggle: () => void;
  loading: boolean;
}

const HospitalInfoWindow: React.FC<HospitalInfoWindowProps> = ({
  selectedMarker,
  handleDirectionsClick,
  handleCloseInfoWindow,
  handleMenuToggle,
  loading,
}) => {
  console.log("Selected Hospital Marker:", selectedMarker); // Debugging

  return (
    <InfoWindow
      position={selectedMarker.position}
      onCloseClick={handleCloseInfoWindow}
    >
      <div className="info-window-content" style={{ minWidth: '300px', maxWidth: '300px' }}>
        <div className="text-gray-900">
          <h2 className="text-xl font-bold mb-2">{selectedMarker.title}</h2>
          <p className="mb-2">電話番号: {selectedMarker.phone}</p>
          <p className="mb-2">病床数: {selectedMarker.numberOfBeds}</p>
          <p className="mb-4">三次救急対応: {selectedMarker.tertiaryEmergency ? '◯' : '☓'}</p>
        </div>
        <button
          onClick={handleDirectionsClick}
          className={`${loading ? 'bg-orange-500' : 'bg-green-500'} text-white px-4 py-2 rounded w-full mt-2 flex items-center justify-center`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              ルート検索中
            </>
          ) : (
            'ここに向かう'
          )}
        </button>
      </div>
    </InfoWindow>
  );
};

export default HospitalInfoWindow;
