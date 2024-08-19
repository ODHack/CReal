import React, { useState, useEffect } from 'react';
import ModalHeader from './ModalHeader';
import FileUpload from './FileUpload';
import FormInput from './FormInput';
import SubmitButton from './SubmitButton';
import { uploadImageToStorage, addReportToFirestore } from '../utils/firebaseUtils';
import imageCompression from 'browser-image-compression';

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
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (error) => {
            console.error('Error getting location: ', error);
            alert('位置情報の取得に失敗しました。');
          }
        );
      } else {
        alert('このブラウザでは位置情報を取得できません。');
      }
    }
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(selectedFile, options);
        const url = await uploadImageToStorage(compressedFile);
        setImageUrl(url);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('画像の圧縮中にエラーが発生しました。');
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addReportToFirestore(title, description, position, imageUrl);
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
              <h2 className="text-2xl font-bold text-green-500 mb-4">送信が完了しました！</h2>
              <button
                onClick={onClose}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                閉じる
              </button>
            </div>
          ) : (
            <>
              <ModalHeader onClose={onClose} title="報告フォーム" />
              <FileUpload onFileChange={handleFileChange} imageUrl={imageUrl} />
              <FormInput
                title={title}
                description={description}
                onTitleChange={(e) => setTitle(e.target.value)}
                onDescriptionChange={(e) => setDescription(e.target.value)}
              />
            </>
          )}
        </div>
        {!success && <SubmitButton loading={loading} onClick={handleSubmit} />}
      </div>
    </div>
  );
};

export default ReportModal;
