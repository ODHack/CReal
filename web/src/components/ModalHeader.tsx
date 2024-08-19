import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalHeaderProps {
  onClose: () => void;
  title: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose, title }) => (
  <div>
    <button
      onClick={onClose}
      className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
    >
      <FaTimes size={24} />
    </button>
    <h2 className="text-xl font-bold mb-2 text-gray-700">{title}</h2>
  </div>
);

export default ModalHeader;
