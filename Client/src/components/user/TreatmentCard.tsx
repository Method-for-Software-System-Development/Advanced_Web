import React from "react";

interface TreatmentCardProps {
  petName: string;
  visitDate: string;
  vetName: string | null | undefined;
  visitationType: string;
  cost: number;
  notes: string;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({
  petName,
  visitDate,
  vetName,
  visitationType,
  cost,
  notes,
}) => {
  return (
    <div className="bg-[var(--color-cream)] rounded-xl shadow-md p-6 w-full text-[var(--color-greyText)] mobile:p-3 mobile:rounded-lg mobile:shadow-sm">
      <h2 className="text-2xl font-bold text-[var(--color-wine)] mb-4 mobile:text-lg mobile:mb-2 mobile:text-[var(--color-wine)]">
        {petName}
      </h2>
      <div className="space-y-2 text-base mobile:space-y-1 mobile:text-xs">
        <div className="flex flex-wrap gap-x-2 gap-y-1 mobile:flex-col mobile:gap-y-0">
          <span className="font-semibold">Visit Date:</span>
          <span>{new Date(visitDate).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1 mobile:flex-col mobile:gap-y-0">
          <span className="font-semibold">Treating Vet:</span>
          <span>{vetName ? vetName : "Unknown"}</span>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1 mobile:flex-col mobile:gap-y-0">
          <span className="font-semibold">Visitation Type:</span>
          <span>{visitationType}</span>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1 mobile:flex-col mobile:gap-y-0">
          <span className="font-semibold">Cost:</span>
          <span>${cost}</span>
        </div>
        <div className="flex flex-row mobile:flex-col mobile:items-start">
          <span className="font-semibold mobile:mb-1 mr-2">Notes:</span>
          <span className="whitespace-pre-wrap mobile:ml-0 mobile:block">
            {notes}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TreatmentCard;
