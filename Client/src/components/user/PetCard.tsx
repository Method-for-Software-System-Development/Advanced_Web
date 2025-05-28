import React, { useState } from "react";
import { Pet } from "../../types";
import PrescriptionList from "./Prescription";

const PetCard: React.FC<{ pet: Pet }> = ({ pet }) => {
  const [showPrescriptions, setShowPrescriptions] = useState(false);

  return (
    <li className="w-full mb-2 p-3 bg-white rounded-lg shadow flex flex-col min-h-[120px] relative text-base">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <span className="font-bold text-xl">{pet.name}</span>
          <span className="text-gray-500 text-base ml-2">({pet.type})</span>
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between gap-6">
        <span className="text-lg font-semibold">
          Breed: <span className="font-normal text-xl">{pet.breed}</span>
        </span>
        <button
          className="w-44 bg-[#664147] text-white px-6 py-2 rounded hover:bg-[#4d3034] text-base font-semibold transition-colors duration-150"
          onClick={() => setShowPrescriptions((v) => !v)}
        >
          Prescriptions
        </button>
      </div>
      <div className="mb-2 flex items-center justify-between gap-6">
        <span className="text-lg font-semibold">
          Birth Year: <span className="font-normal text-xl">{pet.birthYear}</span>
        </span>
        <button
          className="w-44 bg-[#664147] text-white px-6 py-2 rounded hover:bg-[#4d3034] text-base font-semibold transition-colors duration-150"
          // TODO: Add onClick to open treatments modal/component
        >
          View Treatments
        </button>
      </div>
      {showPrescriptions && (
        <PrescriptionList prescriptionIds={pet.prescriptions} />
      )}
    </li>
  );
};

export default PetCard;