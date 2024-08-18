import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import { db, storage } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const getLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setPosition({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.error('Error getting location: ', error);
              alert('位置情報の取得に失敗しました。');
            }
          );
        } else {
          alert('このブラウザでは位置情報を取得できません。');
        }
      };

      getLocation();
    }
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      // Compress image and upload
      try {
        const options = {
          maxSizeMB: 1,          // 最大サイズ 1MB
          maxWidthOrHeight: 1024, // 最大幅または高さ 1024px
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(selectedFile, options);
        await handleUpload(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('画像の圧縮中にエラーが発生しました。');
      }
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      setUploading(false);
      alert('画像のアップロードが完了しました。');
    } catch (error) {
      console.error('Error uploading file: ', error);
      alert('画像のアップロード中にエラーが発生しました。');
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        title,
        description,
        position,
        imageUrl,
        timestamp: new Date()
      });
      setTitle('');
      setDescription('');
      setPosition(null);
      setImageUrl(null);
      setFile(null);
      setSuccess(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('送信中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow-lg relative w-full max-w-lg h-[500px] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-xl font-bold text-gray-700 mb-4">送信完了</h2>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                閉じる
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
              >
                <FaTimes size={24} />
              </button>
              <h2 className="text-xl font-bold mb-2 text-gray-700">被害状況を報告する</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-gray-300 rounded p-2 w-full bg-white text-gray-700"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-gray-300 rounded p-2 w-full bg-white text-gray-700"
                  rows={4}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">画像アップロード</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
                {imageUrl && (
                  <div className="mt-4">
                    <img
                      src={imageUrl}
                      alt="Selected preview"
                      className="w-full max-h-[400px] object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-center items-center">
                <button
                  onClick={handleSubmit}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
