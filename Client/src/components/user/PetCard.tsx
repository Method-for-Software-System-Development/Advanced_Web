import React, { useState } from "react";
import { Pet } from "../../types";
import PrescriptionList from "./UnfulfilledPrescriptions";
import PetLastTreatment from "./PetLastTreatment";
import "../../styles/mobile-utilities.css";

const PetCard: React.FC<{ pet: Pet }> = ({ pet }) => {
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [showLastTreatment, setShowLastTreatment] = useState(false);

  // Get pet emoji based on type
  const getPetEmoji = (type: string) => {
    const petType = type.toLowerCase();
    if (petType.includes('dog')) return '🐕';
    if (petType.includes('cat')) return '🐱';
    if (petType.includes('bird')) return '🐦';
    if (petType.includes('fish')) return '🐠';
    if (petType.includes('rabbit')) return '🐰';
    if (petType.includes('hamster')) return '🐹';
    return '🐾'; // Default pet emoji
  };
  return (
    <li className="w-full mb-4 bg-[var(--color-cream)] dark:bg-[#4A2F33] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col min-h-[120px] relative text-base text-[var(--color-greyText)] dark:text-gray-200 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getPetEmoji(pet.type)}</span>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mb-1">
              {pet.name}
            </h2>
            <span className="inline-block px-3 py-1 bg-[var(--color-skyDark)] dark:bg-[#4A7C7D] text-[var(--color-wine)] dark:text-[#FDF6F0] text-sm font-semibold rounded-full">
              {pet.type}
            </span>
          </div>
        </div>
      </div>      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-100 dark:border-gray-600">
        <div className="flex items-center">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[80px]">Breed:</span>
          <span className="ml-2 text-[var(--color-greyText)] dark:text-gray-200">{pet.breed}</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[80px]">Born:</span>
          <span className="ml-2 text-[var(--color-greyText)] dark:text-gray-200">{pet.birthYear}</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          className="flex-1 px-6 py-3 bg-[var(--color-wine)] dark:bg-[#58383E] text-white rounded-lg font-semibold shadow hover:bg-[var(--color-wineDark)] dark:hover:bg-[#4A2F33] transition-all duration-200 text-sm hover:scale-105 transform"
          onClick={() => setShowPrescriptions((v) => !v)}
        >
          <span className="flex items-center justify-center gap-2">
            💊
            {showPrescriptions ? "Hide Prescriptions" : "View Prescriptions"}
          </span>
        </button>
        <button
          className="flex-1 px-6 py-3 bg-[var(--color-skyDark)] dark:bg-[#4A7C7D] text-[var(--color-wine)] dark:text-[#FDF6F0] rounded-lg font-semibold shadow hover:bg-[var(--color-sky)] dark:hover:bg-[#3A6C6D] transition-all duration-200 text-sm hover:scale-105 transform"
          onClick={() => setShowLastTreatment((v) => !v)}
        >
          <span className="flex items-center justify-center gap-2">
            🏥
            {showLastTreatment ? "Hide Treatment" : "Last Treatment"}
          </span>
        </button>
      </div>        {showPrescriptions && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg border border-blue-200 dark:border-blue-700">
          <PrescriptionList prescriptionIds={pet.prescriptions} />
        </div>
      )}
      {showLastTreatment && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg border border-green-200 dark:border-green-700">
          <PetLastTreatment petId={pet._id} />
        </div>
      )}
    </li>
  );
};

export default PetCard;
