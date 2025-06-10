import React, { useState } from 'react';
import { API_URL } from '../../config/api';

interface PetImageUploadProps {
  petId: string;
  currentImageUrl?: string;
  onImageUpdate: (newImageUrl: string) => void;
}

const PetImageUpload: React.FC<PetImageUploadProps> = ({
  petId,
  onImageUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {      const formData = new FormData();
      formData.append('image', file);
      formData.append('petId', petId);
      
      const response = await fetch(`${API_URL}/pets/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      onImageUpdate(result.imageUrl);
      setShowUpload(false);
      
      // Reset the input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">      {!showUpload ? (        <button
          onClick={() => setShowUpload(true)}
          className="absolute top-0 right-0 bg-[var(--color-wine)] dark:bg-[var(--color-skyDark)] text-white p-1 rounded-full shadow-md hover:bg-[var(--color-sky)] dark:hover:bg-[var(--color-sky)] transition-colors duration-200 flex items-center justify-center text-xs"
          title="Change pet image"
        >
          📷
        </button>
      ) : (
        <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload new image:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="text-xs text-gray-500 dark:text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--color-wine)] file:text-white hover:file:bg-[var(--color-wineDark)] dark:file:bg-[#58383E] dark:hover:file:bg-[#4A2F33] transition-colors duration-200"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowUpload(false)}
                disabled={isUploading}
                className="px-2 py-1 text-xs bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
            {isUploading && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Uploading...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetImageUpload;
