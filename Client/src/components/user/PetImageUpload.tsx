import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { Camera } from 'lucide-react';

interface PetImageUploadProps {
  petId: string;
  currentImageUrl?: string;
  petType?: string;
  petSex?: string;
  onImageUpdate: (newImageUrl: string) => void;
}

const PetImageUpload: React.FC<PetImageUploadProps> = ({
  petId,
  petType,
  petSex,
  onImageUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);  const uploadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle clicking outside to close the upload panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (uploadRef.current && !uploadRef.current.contains(event.target as Node)) {
        setShowUpload(false);
      }
    };

    if (showUpload) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUpload]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
      try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('petId', petId);
      
      const uploadUrl = `${API_URL}/pets/upload-image`;
      
      const response = await fetch(uploadUrl, {
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
      setIsUploading(false);    }
  };

  const handleUploadFromFolder = () => {
    fileInputRef.current?.click();
  };  const handleDefaultPicture = async () => {
    setIsUploading(true);
    try {
      // Determine the correct default image based on pet type and sex
      const getDefaultImagePath = () => {
        // Supported animal types
        const supportedTypes = ['cat', 'dog', 'goat', 'parrot', 'rabbit', 'snake'];
        
        // Determine animal type (default to alien if not supported)
        const animalType = petType && supportedTypes.includes(petType.toLowerCase()) 
          ? petType.toLowerCase() 
          : 'alien';
        
        // Determine sex suffix (default to _m if not specified or invalid)
        const sexSuffix = petSex && petSex.toLowerCase() === 'female' ? '_f' : '_m';
        
        return `/assets/animals/${animalType}${sexSuffix}.png`;
      };
      
      const defaultImageUrl = getDefaultImagePath();
      
      // Update the pet in the database with the new default image URL
      const response = await fetch(`${API_URL}/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: defaultImageUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pet with default image');
      }

      // Update the local state
      onImageUpdate(defaultImageUrl);
      setShowUpload(false);
    } catch (error) {
      console.error('Error setting default image:', error);
      alert('Failed to set default image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="relative">
      {!showUpload ? (        <button
          onClick={() => setShowUpload(true)}
          className="absolute top-0 right-0 bg-[var(--color-wine)] dark:bg-[var(--color-skyDark)] text-white p-1 rounded-full shadow-md hover:bg-[var(--color-sky)] dark:hover:bg-[var(--color-sky)] transition-colors duration-200 flex items-center justify-center text-xs"
          title="Change pet image"
        >
          <Camera size={16} />
        </button>) : (        <div 
          ref={uploadRef}
          className="absolute md:right-0 md:left-auto md:top-0 -right-48.5 top-0.6 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10"
        ><div className="flex flex-col gap-1 md:gap-2 min-w-[200px] md:min-w-[200px]">
            <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
              Choose Image From:
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            <div className="flex flex-col gap-1 md:gap-2">              <button
                onClick={handleUploadFromFolder}
                disabled={isUploading}
                className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm bg-[var(--color-wine)] hover:bg-[var(--color-wineDark)] dark:bg-[#58383E] dark:hover:bg-[#4A2F33] text-white rounded transition-colors duration-200 flex items-center gap-1 md:gap-2"
              >
                📁 Upload from Device
              </button><button
                onClick={handleDefaultPicture}
                disabled={isUploading}
                className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm bg-[var(--color-skyDark)] dark:bg-[#4A7C7D] text-[var(--color-wine)] dark:text-[#FDF6F0] rounded transition-colors duration-200 hover:bg-[var(--color-sky)] dark:hover:bg-[#3A6C6D] flex items-center gap-1 md:gap-2"
              >
                {(() => {
                  const supportedTypes = ['cat', 'dog', 'goat', 'parrot', 'rabbit', 'snake'];
                  const animalType = petType && supportedTypes.includes(petType.toLowerCase()) 
                    ? petType.toLowerCase() 
                    : 'alien';                  const animalEmojis = {
                    cat: '🐱',
                    dog: '🐶',
                    goat: '🐐',
                    parrot: '🦜',
                    rabbit: '🐰',
                    snake: '🐍',
                    alien: '👽'
                  };
                  
                  return animalEmojis[animalType as keyof typeof animalEmojis];
                })()} Default Image
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
