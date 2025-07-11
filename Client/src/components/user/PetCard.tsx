import React, { useState } from "react";
import { Pet } from "../../types";
import PrescriptionList from "./UnfulfilledPrescriptions";
import PetLastTreatment from "./PetLastTreatment";
import PetImageUpload from "./PetImageUpload";
import { petService } from "../../services/petService";
import { API_BASE_URL } from '../../config/api';
import { Pill, Stethoscope, Camera } from 'lucide-react';
import "../../styles/mobile-utilities.css";

// Import all animal images
import alienF from "../../assets/animals/alien_f.png";
import alienM from "../../assets/animals/alien_m.png";
import catF from "../../assets/animals/cat_f.png";
import catM from "../../assets/animals/cat_m.png";
import dogF from "../../assets/animals/dog_f.png";
import dogM from "../../assets/animals/dog_m.png";
import goatF from "../../assets/animals/goat_f.png";
import goatM from "../../assets/animals/goat_m.png";
import parrotF from "../../assets/animals/parrot_f.png";
import parrotM from "../../assets/animals/parrot_m.png";
import rabbitF from "../../assets/animals/rabbit_f.png";
import rabbitM from "../../assets/animals/rabbit_m.png";
import snakeF from "../../assets/animals/snake_f.png";
import snakeM from "../../assets/animals/snake_m.png";

const PetCard: React.FC<{ pet: Pet }> = ({ pet }) => {
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [showLastTreatment, setShowLastTreatment] = useState(false);
  const [currentPet, setCurrentPet] = useState<Pet>(pet);
  // Handle image update
  const handleImageUpdate = async (newImageUrl: string) => {
    try {
      // Update the pet in the database - ONLY send the imageUrl field
      const updatedPet = await petService.updatePet(currentPet._id, {
        imageUrl: newImageUrl,
      });

      // Update local state
      setCurrentPet(updatedPet);
    } catch (error) {
      console.error('Error updating pet image:', error);
      alert('Failed to update pet image. Please try again.');
    }
  };
  // Create image mapping object
  const imageMap: Record<string, string> = {
    // Handle /assets/animals/ paths
    "/assets/animals/alien_f.png": alienF,
    "/assets/animals/alien_m.png": alienM,
    "/assets/animals/cat_f.png": catF,
    "/assets/animals/cat_m.png": catM,
    "/assets/animals/dog_f.png": dogF,
    "/assets/animals/dog_m.png": dogM,
    "/assets/animals/goat_f.png": goatF,
    "/assets/animals/goat_m.png": goatM,
    "/assets/animals/parrot_f.png": parrotF,
    "/assets/animals/parrot_m.png": parrotM,
    "/assets/animals/rabbit_f.png": rabbitF,
    "/assets/animals/rabbit_m.png": rabbitM,
    "/assets/animals/snake_f.png": snakeF,
    "/assets/animals/snake_m.png": snakeM,
  };  // Get the actual image URL for Vite
  const getImageUrl = (imageUrl: string) => {
    // If it's a Cloudinary URL (starts with http/https), use it directly
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's an uploaded image (starts with /uploads/), use the full server URL
    if (imageUrl.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    // Otherwise, use the mapped asset images
    const mappedImage = imageMap[imageUrl];
    return mappedImage;
  }; return (
    <li className="w-full mb-4 bg-cream dark:bg-darkMode rounded-xl transition-shadow duration-300 p-6 flex flex-col min-h-[120px] relative text-base text-grayText dark:text-white border border-creamDark dark:border-darkModeDark shadow-lg hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">

          {/* Pet image next to name */}
          <div className="relative flex-shrink-0">
            {currentPet.imageUrl && (
              <img
                src={getImageUrl(currentPet.imageUrl)}
                alt={`${currentPet.name} - ${currentPet.type}`}
                className="object-cover rounded-full shadow-md border-2 border-wine pet-image"
              />
            )}

            {/* Image upload overlay */}
            <div className="absolute pet-image-overlay">
              <PetImageUpload
                petId={currentPet._id}
                petType={currentPet.type}
                petSex={currentPet.sex}
                onImageUpdate={handleImageUpdate}
              />
            </div>
          </div>

          {/* Pet name and badges */}
          <div>
            <h2 className={`${currentPet.name.length > 9 ? 'text-base sm:text-2xl' : 'text-2xl'} font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mb-1`}>
              {currentPet.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap pet-badges-container">
              <span className="inline-block px-3 py-1 bg-creamDark text-[var(--color-wine)] text-sm font-semibold rounded-full pet-badge">
                {currentPet.type}
              </span>
              {!currentPet.isActive && (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full pet-badge">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pet Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-6 bg-white dark:bg-darkModeLight rounded-lg p-4">
        <div className="flex items-center">
          <span className="font-semibold text-[var(--color-wine)] dark:text-lightGrayText min-w-[80px]">Breed:</span>
          <span className="text-grayText dark:text-white">{currentPet.breed}</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-[var(--color-wine)] dark:text-lightGrayText min-w-[80px]">Born:</span>
          <span className="text-grayText dark:text-white">{currentPet.birthYear}</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-[var(--color-wine)] dark:text-lightGrayText min-w-[80px]">Weight:</span>
          <span className="text-grayText dark:text-white">{currentPet.weight} kg</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-[var(--color-wine)] dark:text-lightGrayText min-w-[80px]">Sex:</span>
          <span className="text-grayText dark:text-white">{currentPet.sex}</span>
        </div>
      </div>

      {/* Buttons for prescriptions and last treatment */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          disabled={!currentPet.isActive}
          className={`flex items-center justify-center gap-2 h-11 rounded-full font-bold transition-colors duration-200 flex-1 ${!currentPet.isActive
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-pinkDark text-white hover:bg-pinkDarkHover cursor-pointer'
            }`}
          onClick={() => currentPet.isActive && setShowPrescriptions((v) => !v)}
        >
          <Pill size={20} />
          <span>
            {!currentPet.isActive
              ? "Unavailable"
              : (showPrescriptions ? "Hide Prescriptions" : "View Prescriptions")
            }
          </span>
        </button>
        <button
          className="flex items-center justify-center gap-2 h-11 bg-skyDark text-white rounded-full font-bold hover:bg-skyDarkHover transition-colors duration-200 cursor-pointer flex-1"
          onClick={() => setShowLastTreatment((v) => !v)}
        >
          <Stethoscope size={20} />
          <span>
            {showLastTreatment ? "Hide Treatment" : "Last Treatment"}
          </span>
        </button>
      </div>

      {showPrescriptions && (
        <div className="mt-6">
          <PrescriptionList prescriptionIds={pet.prescriptions} />
        </div>
      )}

      {showLastTreatment && (
        <div className="mt-6">
          <PetLastTreatment petId={pet._id} />
        </div>
      )}
    </li>
  );
};

export default PetCard;
