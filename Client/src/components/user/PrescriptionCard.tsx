import React from "react";
import { Prescription } from "../../types";

interface PrescriptionCardProps {
  prescription: Prescription;
  petName?: string; // Optional, for display if available
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription, petName }) => {
  return (
    <div className="bg-[var(--color-cream)] border-2 border-[var(--color-wine)] rounded-xl shadow-md p-6 w-full text-[var(--color-greyText)] mobile:p-3 mobile:text-xs mobile:border-4 mobile:shadow-lg mobile:w-full">
      {/* Mobile stacked view */}
      <div className="sm:hidden">
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="font-bold text-[var(--color-wine)]">Medicine:</span>
          <span className="text-right">{prescription.medicineType}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="font-bold text-[var(--color-wine)]">Quantity:</span>
          <span className="text-right">{prescription.quantity}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="font-bold text-[var(--color-wine)]">Issued:</span>
          <span className="text-right">{new Date(prescription.issueDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="font-bold text-[var(--color-wine)]">Expires:</span>
          <span className="text-right">{new Date(prescription.expirationDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-bold text-[var(--color-wine)]">Fulfilled:</span>
          <span className="text-right">{prescription.fulfilled ? "Yes" : "No"}</span>
        </div>
      </div>
      {/* Desktop view */}
      <div className="space-y-2 text-base hidden sm:block">
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
          <span className="font-semibold">Fulfilled:</span> {prescription.fulfilled ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
};

export default PrescriptionCard;
