import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { MarkerData } from '../types/markerTypes';
import { FaSpinner } from 'react-icons/fa';
// import formatTimeStamp from '../utils/formatTimeStamp';

interface MapInfoWindowProps {
  selectedMarker: MarkerData;
  handleDirectionsClick: () => void;
  handleCloseInfoWindow: () => void;
  handleMenuToggle: () => void;
  loading: boolean; // 必須プロパティとして追加
}


const MapInfoWindow: React.FC<MapInfoWindowProps> = ({ selectedMarker, handleDirectionsClick, handleCloseInfoWindow, handleMenuToggle, isMenuVisible, loading }) => {
  console.log(selectedMarker);

  return (
    <InfoWindow
      position={selectedMarker.position}
      onCloseClick={handleCloseInfoWindow}
    >
      <div className="info-window-content" style={{ maxWidth: '300px'}}>
        <div className="text-gray-900">
          <h2 className="text-xl font-bold mb-2">{selectedMarker.title}</h2>
          <p className="mb-4">{selectedMarker.description}</p>
          {/* <p>{formatTimestamp(selectedMarker.timestamp)}</p> */}
        </div>
        {selectedMarker.imageUrl && (
          <img src={selectedMarker.imageUrl} alt="Report" style={{ maxWidth: '100%', height: '200px' }} />
        )}
        <div className="flex text-gray-700">
          <p className="font-semibold">災害タイプ:</p>
          <p>{selectedMarker.disasterType}</p>
        </div>
        <div className="flex text-gray-700">
          <p className="font-semibold">被害の種類:</p>
          <p>{selectedMarker.damageType}</p>
        </div>
        <div className="flex text-gray-700">
          <p className="font-semibold">被害の程度:</p>
          <p>{selectedMarker.damageLevel}</p>
        </div>
        <div className="flex text-gray-700">
          <p className="font-semibold">影響を受けたエリア:</p>
          <p>{selectedMarker.affectedArea}</p>
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
          )
          : (
            'ここに向かう'
          )}
        </button>
        <button
          onClick={handleMenuToggle}
          className={`px-4 py-2 rounded w-full mt-2 ${!isMenuVisible ? 'bg-blue-500 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-500 text-black'}`}
        >
          {isMenuVisible ? "コメントを非表示": "コメントを表示"}
        </button>
      </div>
    </InfoWindow>
  );
};

export default MapInfoWindow;
