import React, { useState }  from 'react';
import Map from '../components/Map';
import ReportModal from '../components/ReportModal';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
      </div>
      <Map />

      {isModalOpen && (
        <ReportModal isOpen={isModalOpen} onClose={closeModal} />
      )}
    </div>
  );
}

export default Home;
