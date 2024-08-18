import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">モーダルタイトル</h2>
        <p className="mb-4">モーダルの内容がここに入ります。</p>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
