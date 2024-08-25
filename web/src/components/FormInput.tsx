import React from 'react';

interface FormInputProps {
  title: string;
  description: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({ title, description, onTitleChange, onDescriptionChange, isMenuVisible }) => (
  <>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
      <input
        type="text"
        value={title}
        onChange={onTitleChange}
        className="border border-gray-300 rounded p-2 w-full bg-white text-gray-700"
      />
    </div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
      <textarea
        value={description}
        onChange={onDescriptionChange}
        className="border border-gray-300 rounded p-2 w-full bg-white text-gray-700"
        rows={4}
      />
    </div>
  </>
);

export default FormInput;
