import React, { useState } from 'react';
import Map from '../components/Map';
import ReportModal from '../components/ReportModal';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAED, setShowAED] = useState(true);
  const [showEvacuation, setShowEvacuation] = useState(true);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFilterChange = (type: 'aed' | 'evacuation') => {
    if (type === 'aed') {
      setShowAED(!showAED);
    } else if (type === 'evacuation') {
      setShowEvacuation(!showEvacuation);
    }
  };

  const handleShowRoute = (type: 'aed' | 'evacuation') => {
    // ここで必要なロジックを追加する
    // 例えば、特定のマーカーの位置を取得して、経路を表示するなどの処理を行います
    console.log(`Show route to the nearest ${type}`);
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="w-3/12 bg-gray-100 p-4 text-black">
        <button
          onClick={openModal}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
        >
          被害状況を報告
        </button>
        <div className="mt-4">
          <button
            onClick={() => handleFilterChange('aed')}
            className={`w-full px-4 py-2 rounded ${showAED ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'}`}
          >
            {showAED ? 'AEDを非表示にする' : 'AEDを表示する'}
          </button>
          <button
            onClick={() => handleFilterChange('evacuation')}
            className={`w-full mt-2 px-4 py-2 rounded ${showEvacuation ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'}`}
          >
            {showEvacuation ? '避難所を非表示にする' : '避難所を表示する'}
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={() => handleShowRoute('aed')}
            className="w-full mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            一番近くのAEDまでの経路を表示
          </button>
          <button
            onClick={() => handleShowRoute('evacuation')}
            className="w-full mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            一番近くの避難所までの経路を表示
          </button>
        </div>
        <div className="mt-4 text-gray-700">
          <p>
            災害時のために、<a href="https://example.com/wifi" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">災害用Wi-Fiサービス</a>をご紹介します。こちらのリンクをクリックすると、サービス提供ページに移動できます。
          </p>
        </div>
      </div>
      <Map showAED={showAED} showEvacuation={showEvacuation} />
      {isModalOpen && (
        <ReportModal isOpen={isModalOpen} onClose={closeModal} />
      )}
    </div>
  );
}

export default Home;
