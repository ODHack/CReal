import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { AEDMarkerData } from '../types/markerTypes';
import { FaSpinner } from 'react-icons/fa';

interface AEDInfoWindowProps {
  selectedMarker: AEDMarkerData;
  handleDirectionsClick: () => void;
  handleCloseInfoWindow: () => void;
  handleMenuToggle: () => void;
  loading: boolean;
}

const AEDInfoWindow: React.FC<AEDInfoWindowProps> = ({ selectedMarker, handleDirectionsClick, handleCloseInfoWindow, handleMenuToggle, loading }) => {
  return (
    <InfoWindow
      position={selectedMarker.position}
      onCloseClick={handleCloseInfoWindow}
      // options={{ pixelOffset: new google.maps.Size(0, -30) }} // Adjust the position of the InfoWindow if needed
    >
      <div className="info-window-content" style={{ minWidth: '300px', maxWidth: '300px'}}>
        <div className="text-gray-900">
          <h2 className="text-xl font-bold mb-2">{selectedMarker.title}</h2>
          <p className="mb-4">設置場所: {selectedMarker.place}</p>
        </div>
        <button
          onClick={handleDirectionsClick}
          className={`${loading ? 'bg-orange-500' : 'bg-green-500 hover:bg-green-700'} text-white px-4 py-2 rounded w-full mt-2 flex items-center justify-center`}
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

export default AEDInfoWindow;