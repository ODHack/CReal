import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';
import { db, storage } from '../utils/firebase'; // Correct import path
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Updated import path

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
      onClose();
      alert('レポートが送信されました!');
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('送信中にエラーが発生しました。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          <FaTimes size={24} />
        </button>
        <h2 className="text-xl font-bold mb-2">モーダルタイトル</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
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
          {uploading && <p>アップロード中...</p>}
          {imageUrl && !uploading && (
            <img src={imageUrl} alt="Uploaded" className="mt-4 max-w-full h-auto" />
          )}
        </div>
        {position && (
          <div className="mb-4">
            <p><strong>位置情報:</strong></p>
            <p>緯度: {position.lat}</p>
            <p>経度: {position.lng}</p>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          送信
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
