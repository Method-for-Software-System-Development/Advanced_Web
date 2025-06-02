import React from "react";
import { Prescription } from "../../types";

interface PrescriptionCardProps {
  prescription: Prescription;
  petName?: string; // Optional, for display if available
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription, petName }) => {
  return (
    <div className="bg-[var(--color-cream)] border-2 border-[var(--color-wine)] rounded-xl shadow-md p-6 w-full text-[var(--color-greyText)]">
      <div className="space-y-2 text-base">
        <p>
          <span className="font-semibold">Medicine:</span> {prescription.medicineType}
        </p>
        <p>
          <span className="font-semibold">Quantity:</span> {prescription.quantity}
        </p>
        <p>
          <span className="font-semibold">Issued:</span> {new Date(prescription.issueDate).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold">Expires:</span> {new Date(prescription.expirationDate).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold">Referral Type:</span> {prescription.referralType}
        </p>
        <p>
          <span className="font-semibold">Cost:</span> {Number.isInteger(prescription.cost) ? prescription.cost : prescription.cost.toFixed(2)}$
        </p>
        <p>
          <span className="font-semibold">Fulfilled:</span> {prescription.fulfilled ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
};

export default PrescriptionCard;
