import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { EvacuationMarkerData } from '../types/markerTypes';
import { FaSpinner } from 'react-icons/fa';

interface EvacuationInfoWindowProps {
  selectedMarker: EvacuationMarkerData;
  handleDirectionsClick: () => void;
  handleCloseInfoWindow: () => void;
  handleMenuToggle: () => void;
  loading: boolean;
}

const EvacuationInfoWindow: React.FC<EvacuationInfoWindowProps> = ({ selectedMarker, handleDirectionsClick, handleCloseInfoWindow, handleMenuToggle, loading }) => {
  return (
    <InfoWindow
      position={selectedMarker.position}
      onCloseClick={handleCloseInfoWindow}
    >
      <div className="info-window-content" style={{ maxWidth: '300px' }}>
        <div className="text-gray-900">
          <h2 className="text-xl font-bold mb-2">{selectedMarker.title}</h2>
          <p className="mb-2">エレベーター1階: {selectedMarker.elvator1f ? 'あり' : 'なし'}</p>
          <p className="mb-2">スロープ: {selectedMarker.slope ? 'あり' : 'なし'}</p>
          <p className="mb-2">点字ブロック: {selectedMarker.brailleBlock ? 'あり' : 'なし'}</p>
          <p className="mb-4">車椅子トイレ: {selectedMarker.WheelchairToilet ? 'あり' : 'なし'}</p>
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

export default EvacuationInfoWindow;
