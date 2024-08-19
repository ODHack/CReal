import React from 'react';

interface FileUploadProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageUrl: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, imageUrl }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">画像アップロード</label>
    <input
      type="file"
      accept="image/*"
      onChange={onFileChange}
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
);

export default FileUpload;
