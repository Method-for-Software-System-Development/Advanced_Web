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
    <div className="bg-[var(--color-cream)] dark:bg-[#4A2F33] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 w-full text-[var(--color-greyText)] dark:text-gray-200 mobile:p-3 mobile:rounded-lg mobile:shadow-sm border border-gray-100 dark:border-gray-600">      {/* Header with Medicine Name and Status */}
      {/* Desktop/Tablet view - horizontal layout */}
      <div className="hidden sm:flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0]">
           {prescription.medicineType}
        </h2>
        <div className="flex items-center gap-2">
          {isExpired ? (
            <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
               Expired
            </span>
          ) : isExpiringSoon ? (
            <span className="bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
               Expiring Soon
            </span>
          ) : (
            <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
               Valid
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            prescription.fulfilled 
              ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' 
              : 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200'
          }`}>
            {prescription.fulfilled ? "Fulfilled" : "Pending"}
          </span>
        </div>
      </div>      {/* Mobile view - vertical layout */}
      <div className="sm:hidden mb-4">
        <h2 className="text-[17px] font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mb-2">
           {prescription.medicineType}
        </h2>
        <div className="flex items-center gap-2">
          {isExpired ? (
            <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
               Expired
            </span>
          ) : isExpiringSoon ? (
            <span className="bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
               Expiring Soon
            </span>
          ) : (
            <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
               Valid
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            prescription.fulfilled 
              ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' 
              : 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200'
          }`}>
            {prescription.fulfilled ? "Fulfilled" : "Pending"}
          </span>
        </div>
      </div>        {/* Prescription Details Grid - Desktop/Tablet view */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div className="space-y-3">
          <div className="flex items-center">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[120px]">Quantity:</span>
            <span className="ml-2 text-sm font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]">
              {prescription.quantity}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[120px]">Referral Type:</span>
            <span className="ml-2 text-sm text-[var(--color-wine)] dark:text-[#FDF6F0]">
              {prescription.referralType}
            </span>
          </div>
        </div>
          <div className="space-y-3">
          <div className="flex items-center">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[80px]">Issued:</span>
            <span className="ml-2 text-sm text-[var(--color-wine)] dark:text-[#FDF6F0]">{issueDate}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[80px]">Expires:</span>
            <span className={`ml-2 text-sm font-medium ${
              isExpired ? 'text-red-600 dark:text-red-400' : isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {expiryDate}
            </span>
          </div>
        </div>
      </div>      {/* Mobile stacked view for better mobile experience */}
      <div className="sm:hidden pt-2">
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Quantity:</span>
          <span className="text-xs font-semibold dark:text-gray-100">
            {prescription.quantity}
          </span>
        </div>        <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
          {/* Referral section - vertical layout if text is too long for one line */}
        <div className={`py-2 ${(prescription.referralType.length > 30) ? 'flex flex-col gap-1' : 'flex justify-between items-center'}`}>
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Referral:</span>
          <span className={`text-xs dark:text-gray-200 break-words ${(prescription.referralType.length > 30) ? 'text-left' : ''}`}>
            {prescription.referralType}
          </span>
        </div>
        <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
        
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Issued:</span>
          <span className="text-xs text-right">{issueDate}</span>
        </div>
        <div className="border-t border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
        
        <div className="flex justify-between items-center py-2">
          <span className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-xs">Expires:</span>
          <span className={`text-xs font-medium text-right ${
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
