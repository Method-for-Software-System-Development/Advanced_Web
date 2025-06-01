import React from 'react';

interface ImageUploadProps {
  imagePreview: string | null;
  selectedImage: File | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  imagePreview,
  selectedImage,
  onImageChange,
  onRemoveImage,
}) => {
  return (
    <div className="mb-5">
      <h4 className="text-lg font-semibold text-[#664147] dark:text-[#F7C9D3] mb-3">Staff Image</h4>
      <input
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#664147] file:text-white hover:file:bg-[#58383E] dark:file:bg-[#F7C9D3] dark:file:text-[#3B3B3B] dark:hover:file:bg-[#EF92A6] transition-colors duration-200"
        id="staffImage"
      />
      {imagePreview && (
        <div className="mt-3 flex flex-col items-start">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-w-[200px] max-h-[200px] border border-gray-300 dark:border-gray-600 rounded-md p-1 object-cover shadow-sm"
          />
          <button 
            type="button" 
            onClick={onRemoveImage} 
            className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md shadow-sm transition-colors duration-150"
          >
            Remove Image
          </button>
        </div>
      )}
      {!imagePreview && selectedImage && (
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Image selected: {selectedImage.name}</p>
      )}
    </div>
  );
};

export default ImageUpload;
