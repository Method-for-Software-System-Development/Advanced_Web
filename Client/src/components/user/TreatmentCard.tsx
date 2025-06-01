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
    <div className="bg-[var(--color-cream)] rounded-xl shadow-md p-6 w-full text-[var(--color-greyText)]">
      <h2 className="text-2xl font-bold text-[var(--color-wine)] mb-4">{petName}</h2>
      <div className="space-y-2 text-base">
        <p>
          <span className="font-semibold">Visit Date:</span> {new Date(visitDate).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold">Treating Vet:</span> {vetName ? vetName : "Unknown"}
        </p>
        <p>
          <span className="font-semibold">Visitation Type:</span> {visitationType}
        </p>
        <p>
          <span className="font-semibold">Cost:</span> ${cost}
        </p>
        <p>
          <span className="font-semibold">Notes:</span>{" "}
          <span className="whitespace-pre-wrap">{notes}</span>
        </p>
      </div>
    </div>
  );
};

export default TreatmentCard;
