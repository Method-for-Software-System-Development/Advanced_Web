import React, { useState } from "react";
import { Pet } from "../../types";
import PrescriptionList from "./UnfulfilledPrescriptions";
import PetLastTreatment from "./PetLastTreatment";
import PetImageUpload from "./PetImageUpload";
import { petService } from "../../services/petService";
import { API_BASE_URL } from '../../config/api';
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
    // If it's an uploaded image (starts with /uploads/), use the full server URL
    if (imageUrl.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    // Otherwise, use the mapped asset images
    const mappedImage = imageMap[imageUrl];
    return mappedImage;
  };  return (
    <li className="w-full mb-4 bg-[var(--color-cream)] dark:bg-[#4A2F33] rounded-xl transition-shadow duration-300 p-6 flex flex-col min-h-[120px] relative text-base text-[var(--color-greyText)] dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl"><div className="flex items-center justify-between mb-4">        <div className="flex items-center gap-3">
          {/* Pet image next to name */}          <div className="relative flex-shrink-0">
            {currentPet.imageUrl ? (
              <img 
                src={getImageUrl(currentPet.imageUrl)} 
                alt={`${currentPet.name} - ${currentPet.type}`}
                className="object-cover rounded-full shadow-md border-2 border-[var(--color-skyDark)] dark:border-[#4A7C7D] pet-image"
              />            ) : (
              <div 
                className="bg-gradient-to-br from-[var(--color-sky)] to-[var(--color-skyDark)] dark:from-[#4A7C7D] dark:to-[#3A6C6D] rounded-full shadow-md border-2 border-[var(--color-wine)] dark:border-[#4A7C7D] flex items-center justify-center pet-image"
              >
                <span className="text-2xl">📷</span>
              </div>            )}
            {/* Image upload overlay */}            <div className="absolute pet-image-overlay">
              <PetImageUpload 
                petId={currentPet._id} 
                petType={currentPet.type}
                petSex={currentPet.sex}
                onImageUpdate={handleImageUpdate} 
              />
            </div>
          </div>          <div>            <h2 className={`${currentPet.name.length > 9 ? 'text-base sm:text-2xl' : 'text-2xl'} font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mb-1`}>
              {currentPet.name}
            </h2>            <div className="flex items-center gap-2 flex-wrap pet-badges-container">
              <span className="inline-block px-3 py-1 bg-[var(--color-skyDark)] dark:bg-[#4A7C7D] text-[var(--color-wine)] dark:text-[#FDF6F0] text-sm font-semibold rounded-full pet-badge">
                {currentPet.type}
              </span>
              {!currentPet.isActive && (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm font-semibold rounded-full pet-badge">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
        <div className="flex items-center">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[80px]">Breed:</span>
          <span className="ml-2 text-[var(--color-greyText)] dark:text-gray-200">{currentPet.breed}</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[80px]">Born:</span>
          <span className="ml-2 text-[var(--color-greyText)] dark:text-gray-200">{currentPet.birthYear}</span>
        </div>
      </div>      <div className="flex flex-col sm:flex-row gap-3">
        <button
          disabled={!currentPet.isActive}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold shadow text-sm transition-all duration-200 ${
            !currentPet.isActive 
              ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed' 
              : 'bg-[var(--color-wine)] dark:bg-[#58383E] text-white hover:bg-[var(--color-wineDark)] dark:hover:bg-[#4A2F33] hover:scale-105 transform'
          }`}
          onClick={() => currentPet.isActive && setShowPrescriptions((v) => !v)}
        >          <span className="flex items-center justify-center gap-2">
            
            {!currentPet.isActive 
              ? "Unavailable" 
              : (showPrescriptions ? "Hide Prescriptions" : "View Prescriptions")
            }
          </span>
        </button>
        <button
          className="flex-1 px-6 py-3 bg-[var(--color-skyDark)] dark:bg-[#4A7C7D] text-[var(--color-wine)] dark:text-[#FDF6F0] rounded-lg font-semibold shadow hover:bg-[var(--color-sky)] dark:hover:bg-[#3A6C6D] transition-all duration-200 text-sm hover:scale-105 transform"
          onClick={() => setShowLastTreatment((v) => !v)}
        >
          <span className="flex items-center justify-center gap-2">
            
            {showLastTreatment ? "Hide Treatment" : "Last Treatment"}
          </span>
        </button>      </div>      {showPrescriptions && (
        <div className="mt-6">
          <PrescriptionList prescriptionIds={pet.prescriptions} />
        </div>
      )}      {showLastTreatment && (        <div className="mt-6">
          <PetLastTreatment petId={pet._id} />
        </div>
      )}
    </li>
  );
};

export default PetCard;
