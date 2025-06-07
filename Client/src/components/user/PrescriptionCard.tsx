import React from "react";
import { Prescription } from "../../types";

interface PrescriptionCardProps {
  prescription: Prescription;
  petName?: string; // Optional, for display if available
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription }) => {
  // Format dates more elegantly
  const issueDate = new Date(prescription.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const expiryDate = new Date(prescription.expirationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check if prescription is expired or expiring soon
  const now = new Date();
  const expiry = new Date(prescription.expirationDate);
  const isExpired = expiry < now;
  const isExpiringSoon = !isExpired && (expiry.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
  return (
    <div className="bg-[var(--color-cream)] dark:bg-[#4A2F33] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 w-full text-[var(--color-greyText)] dark:text-gray-200 mobile:p-3 mobile:rounded-lg mobile:shadow-sm border border-gray-100 dark:border-gray-600">
      {/* Header with Medicine Name and Status */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mobile:text-lg">
          💊 {prescription.medicineType}
        </h2>        <div className="flex items-center gap-2">
          {isExpired ? (
            <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
              ⚠️ Expired
            </span>
          ) : isExpiringSoon ? (
            <span className="bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
              ⏰ Expiring Soon
            </span>
          ) : (
            <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
              ✅ Valid
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            prescription.fulfilled 
              ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' 
              : 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200'
          }`}>
            {prescription.fulfilled ? "✅ Fulfilled" : "⏳ Pending"}
          </span>
        </div>
      </div>
      
      {/* Prescription Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]">📦 Quantity:</span>
            <span className="bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded-full text-sm font-semibold dark:text-purple-100">
              {prescription.quantity}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]">🏥 Referral Type:</span>
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-sm dark:text-gray-200">
              {prescription.referralType}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]">📅 Issued:</span>
            <span className="text-sm">{issueDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]">⏰ Expires:</span>
            <span className={`text-sm font-medium ${
              isExpired ? 'text-red-600 dark:text-red-400' : isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {expiryDate}
            </span>
          </div>
        </div>
      </div>      {/* Mobile stacked view for better mobile experience */}
      <div className="sm:hidden space-y-2 border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex justify-between py-1">
          <span className="font-bold text-[var(--color-wine)] dark:text-[#FDF6F0]">Quantity:</span>
          <span className="text-right">{prescription.quantity}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-bold text-[var(--color-wine)] dark:text-[#FDF6F0]">Referral Type:</span>
          <span className="text-right">{prescription.referralType}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-bold text-[var(--color-wine)] dark:text-[#FDF6F0]">Issued:</span>
          <span className="text-right">{issueDate}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="font-bold text-[var(--color-wine)] dark:text-[#FDF6F0]">Expires:</span>
          <span className={`text-right font-medium ${
            isExpired ? 'text-red-600 dark:text-red-400' : isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {expiryDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;
