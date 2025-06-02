import React, { useState } from "react";
import { Pet } from "../../types";
import PrescriptionList from "./UnfulfilledPrescriptions";
import PetLastTreatment from "./PetLastTreatment";
import "../../styles/mobile-utilities.css";

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
      <div className="flex flex-wrap gap-2 mb-4 items-center mobile:flex-col mobile:items-start mobile:gap-1">
        <div className="flex items-center min-w-[237px] max-w-[237px] mobile:min-w-0 mobile:max-w-full mobile:w-full mobile:flex-row mobile:items-center mobile:pl-2">
          <span className="font-semibold mobile:min-w-[100px]">Breed:</span>
          <span className="ml-2 truncate w-[140px] mobile:w-auto mobile:inline">
            {pet.breed}
          </span>
        </div>
        <div className="flex items-center ml-2 mobile:ml-0 mobile:mt-1 mobile:w-full mobile:flex-row mobile:items-center mobile:pl-2" style={{marginLeft: 0, paddingLeft: 0, position: 'relative', left: '0px'}}>
          <span className="font-semibold mobile:min-w-[100px]">Birth Year:</span>
          <span className="ml-2">{pet.birthYear}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-2">
        <button
          className="px-8 py-3 bg-[var(--color-wine)] text-white rounded-lg font-semibold shadow hover:bg-[var(--color-wineDark)] transition-colors duration-150 whitespace-nowrap text-base sm:text-sm max-w-full mobile:text-xs mobile:px-4 mobile:py-2 mobile:w-full"
          onClick={() => setShowPrescriptions((v) => !v)}
        >
          {showPrescriptions
            ? "Hide Unfulfilled Prescriptions"
            : "Unfulfilled Prescriptions"}
        </button>
        <button
          className="px-8 py-3 bg-[var(--color-skyDark)] text-[var(--color-wine)] rounded-lg font-semibold shadow hover:bg-[var(--color-sky)] transition-colors duration-150 text-base sm:text-sm mobile:text-xs mobile:px-4 mobile:py-2 mobile:w-full"
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
