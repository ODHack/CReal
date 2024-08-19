import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface SubmitButtonProps {
  loading: boolean;
  onClick: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, onClick }) => (
  <div className="flex justify-center items-center">
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded w-full flex justify-center items-center 
                  ${loading ? 'bg-orange-500' : 'bg-blue-500'} 
                  text-white`}
      disabled={loading}
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin mr-2" />
          送信中...
        </>
      ) : (
        '送信'
      )}
    </button>
  </div>
);

export default SubmitButton;
