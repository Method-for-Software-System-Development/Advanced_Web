import React, { useState } from "react";
import { Pet } from "../../types";
import PrescriptionList from "./UnfulfilledPrescriptions";
import PetLastTreatment from "./PetLastTreatment";

const PetCard: React.FC<{ pet: Pet }> = ({ pet }) => {
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [showLastTreatment, setShowLastTreatment] = useState(false);

  return (
    <li className="w-full mb-4 bg-[var(--color-cream)] rounded-xl shadow-md p-6 flex flex-col min-h-[120px] relative text-base text-[var(--color-greyText)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[var(--color-wine)]">
          {pet.name}{" "}
          <span className="text-base text-[var(--color-greyText)] font-normal">
            ({pet.type})
          </span>
        </h2>
      </div>
      <div className="flex flex-wrap gap-8 mb-4">
        <div>
          <span className="font-semibold">Breed:</span> {pet.breed}
        </div>
        <div>
          <span className="font-semibold">Birth Year:</span> {pet.birthYear}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-2">
        <button
          className="px-6 py-2 bg-[var(--color-wine)] text-white rounded-lg font-semibold shadow hover:bg-[var(--color-wineDark)] transition-colors duration-150"
          onClick={() => setShowPrescriptions((v) => !v)}
        >
          {showPrescriptions
            ? "Hide Unfulfilled Prescriptions"
            : "Unfulfilled Prescriptions"}
        </button>
        <button
          className="px-6 py-2 bg-[var(--color-skyDark)] text-[var(--color-wine)] rounded-lg font-semibold shadow hover:bg-[var(--color-sky)] transition-colors duration-150"
          onClick={() => setShowLastTreatment((v) => !v)}
        >
          {showLastTreatment ? "Hide Last Treatment" : "Last Treatment"}
        </button>
      </div>
      {showPrescriptions && (
        <div className="mt-4">
          <PrescriptionList prescriptionIds={pet.prescriptions} />
        </div>
      )}
      {showLastTreatment && (
        <div className="mt-4">
          <PetLastTreatment petId={pet._id} />
        </div>
      )}
    </li>
  );
};

export default PetCard;
