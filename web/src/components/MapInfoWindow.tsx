import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { MarkerData } from '../types/markerTypes';

interface MapInfoWindowProps {
  selectedMarker: MarkerData;
  handleDirectionsClick: () => void;
  handleCloseInfoWindow: () => void;
}

const MapInfoWindow: React.FC<MapInfoWindowProps> = ({ selectedMarker, handleDirectionsClick, handleCloseInfoWindow }) => {
  return (
    <InfoWindow
      position={selectedMarker.position}
      onCloseClick={handleCloseInfoWindow}
    >
      <div className="info-window-content" style={{ maxWidth: '300px' }}>
        <div className="text-gray-900">
          <h2 className="text-xl font-bold mb-2">{selectedMarker.title}</h2>
          <p className="mb-4">{selectedMarker.description}</p>
        </div>
        {selectedMarker.imageUrl && (
          <img src={selectedMarker.imageUrl} alt="Report" style={{ maxWidth: '100%', height: 'auto' }} />
        )}
        <button
          onClick={handleDirectionsClick}
          className="bg-green-500 text-white px-4 py-2 rounded w-full mt-2"
        >
          ここに向かう
        </button>
      </div>
    </InfoWindow>
  );
};

export default MapInfoWindow;
