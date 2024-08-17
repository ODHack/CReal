// src/components/Home.tsx
import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

// Google Mapsのスタイルを設定します。サイズは適宜調整してください。
const containerStyle = {
  width: '100%',
  height: '100%' // 高さを親コンテナに合わせる
};

// 初期表示の中心位置とズームレベルを設定します。
const center = {
  lat: 35.682839, // 東京駅の緯度
  lng: 139.759455 // 東京駅の経度
};

function Home() {
  return (
    <div className="flex h-screen w-screen">
      <div className="w-3/12 bg-gray-100 p-4 text-black">
        <div>ここら辺に色んなボタンとかをつけるイメージ？？？</div>
      </div>

      {/* <div className="w-9/12 h-full">
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY!}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          >
          </GoogleMap>
        </LoadScript>
      </div> */}
    </div>
  );
}

export default Home;
