import React, { useState } from "react";
import { Pet } from "../../types";
import PrescriptionList from "./UnfulfilledPrescriptions";
import PetLastTreatment from "./PetLastTreatment";

const PetCard: React.FC<{ pet: Pet }> = ({ pet }) => {
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [showLastTreatment, setShowLastTreatment] = useState(false);

  return (
    <li className="w-full mb-2 p-4 bg-white rounded-xl shadow flex flex-col min-h-[120px] relative text-base">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-xl font-bold text-gray-800">
            {pet.name} <span className="text-gray-500 text-base">({pet.type})</span>
          </h2>
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between gap-6">
        <p className="text-base text-gray-700">
          <span className="font-semibold">Breed:</span>{" "}
          <span>{pet.breed}</span>
        </p>
        <button
          className="w-56 bg-[#664147] text-white px-4 py-2 rounded hover:bg-[#4d3034] text-base font-semibold transition-colors duration-150 whitespace-nowrap"
          onClick={() => setShowPrescriptions((v) => !v)}
        >
          Unfulfilled Prescriptions
        </button>
      </div>
      <div className="mb-2 flex items-center justify-between gap-6">
        <p className="text-base text-gray-700">
          <span className="font-semibold">Birth Year:</span>{" "}
          <span>{pet.birthYear}</span>
        </p>
        <button
          className="w-56 bg-[#664147] text-white px-4 py-2 rounded hover:bg-[#4d3034] text-base font-semibold transition-colors duration-150 whitespace-nowrap"
          onClick={() => setShowLastTreatment((v) => !v)}
        >
          Last Treatment
        </button>
      </div>
      {showPrescriptions && (
        <PrescriptionList prescriptionIds={pet.prescriptions} />
      )}
      {showLastTreatment && (
        <PetLastTreatment petId={pet._id} />
      )}
    </li>
  );
};

export default PetCard;
