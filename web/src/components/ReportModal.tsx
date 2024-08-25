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

  // タグの状態を追加
  const [disasterType, setDisasterType] = useState('');
  const [damageLevel, setDamageLevel] = useState('');
  const [affectedArea, setAffectedArea] = useState('');
  const [damageType, setDamageType] = useState('');
  const [responseAction, setResponseAction] = useState('');

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
          maxSizeMB: 10,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(selectedFile, options);
        const url = await uploadImageToStorage(compressedFile);
        setImageUrl(url);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('画像の圧縮中にエラーが発生しました。ファイルサイズが大きすぎる可能性があります。');
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addReportToFirestore(
        title,
        description,
        position,
        imageUrl,
        disasterType,
        damageLevel,
        affectedArea,
        damageType,
        responseAction
      );
      setSuccess(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('送信中にエラーが発生しました。ファイルサイズが大きすぎる可能性があります。');
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
              <h2 className="text-2xl font-bold text-gray-500 mb-4">送信が完了しました</h2>
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
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">災害タイプ</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-700 h-8"
                >
                  <option value="">選択してください</option>
                  <option value="地震">地震</option>
                  <option value="豪雨">大雨</option>
                  <option value="台風">台風</option>
                  <option value="雷">雷</option>
                  <option value="雪害">雪害</option>
                  <option value="火事">火事</option>
                  <option value="土砂崩れ">土砂崩れ</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">被害の程度</label>
                <select
                  value={damageLevel}
                  onChange={(e) => setDamageLevel(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-700 h-8"
                >
                  <option value="">選択してください</option>
                  <option value="軽度">軽度</option>
                  <option value="中程度">中程度</option>
                  <option value="重大">重大</option>
                  <option value="壊滅的">壊滅的</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">被害の種類</label>
                <select
                  value={damageType}
                  onChange={(e) => setDamageType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-700 h-8"
                >
                  <option value="">選択してください</option>
                  <option value="建物損壊">建物損壊</option>
                  <option value="インフラ障害">インフラ障害</option>
                  <option value="停電">停電</option>
                  <option value="水害">水害</option>
                  <option value="交通障害">交通障害</option>
                  <option value="通信障害">通信障害</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">影響を受けたエリア</label>
                <select
                  value={affectedArea}
                  onChange={(e) => setAffectedArea(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-700 h-8"
                >
                  <option value="">選択してください</option>
                  <option value="住宅地">住宅地</option>
                  <option value="商業地">商業地</option>
                  <option value="公共施設">公共施設</option>
                  <option value="交通機関">交通機関</option>
                  <option value="農業地域">農業地域</option>
                  <option value="山間部">山間部</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">求める対策や対応</label>
                <select
                  value={responseAction}
                  onChange={(e) => setResponseAction(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-700 h-8 mb-4"
                >
                  <option value="">選択してください</option>
                  <option value="救援活動">救援活動</option>
                  <option value="避難指示">避難指示</option>
                  <option value="復旧作業">復旧作業</option>
                  <option value="支援物資">支援物資</option>
                  <option value="警報発令">警報発令</option>
                  <option value="通行止め">通行止め</option>
                  <option value="その他">その他</option>
                </select>
              </div>
            </>
          )}
        </div>
        {!success && <SubmitButton loading={loading} onClick={handleSubmit} />}
      </div>
    </div>
  );
};

export default ReportModal;
