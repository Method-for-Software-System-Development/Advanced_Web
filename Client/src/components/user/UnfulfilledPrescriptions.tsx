import React, { useEffect, useState } from "react";
import { Prescription } from "../../types";
import { API_URL } from '../../config/api';

interface PrescriptionListProps {
  prescriptionIds: string[];
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({ prescriptionIds }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!prescriptionIds.length) {
      setPrescriptions([]);
      setLoading(false);
      return;
    }    setLoading(true);
    fetch(`${API_URL}/prescriptions/byIds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: prescriptionIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Only show unfulfilled prescriptions
        const unfulfilled = Array.isArray(data)
          ? data.filter((p) => !p.fulfilled)
          : [];
        setPrescriptions(unfulfilled);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load prescriptions");
        setLoading(false);
      });
  }, [prescriptionIds]);
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-4 mt-2 w-full">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-wine)] dark:border-[#FDF6F0]"></div>
            <span className="text-sm text-[var(--color-wine)] dark:text-[#FDF6F0]">Loading prescriptions...</span>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 rounded-lg shadow p-4 mt-2 w-full border border-red-200 dark:border-red-600">
        <div className="flex items-center text-red-700 dark:text-red-200">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }  if (!prescriptions.length) {
    return (
      <div className="bg-green-50 dark:bg-green-900 rounded-lg shadow p-4 mt-2 w-full border border-green-200 dark:border-green-600">
        <div className="flex items-center text-green-700 dark:text-green-200">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-[9px] sm:text-sm">All prescriptions fulfilled! 🎉</span>
        </div>
      </div>
    );
  }return (
    <div className="bg-gray-50 dark:bg-[#4A2F33] rounded-lg shadow p-3 sm:p-4 mt-2 w-full">
      <h4 className="font-bold mb-3 sm:mb-4 text-[#664147] dark:text-[#FDF6F0] text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
        <span>💊 Unfulfilled Prescriptions</span>
        <span className="text-xs sm:text-sm font-normal bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full text-orange-700 dark:text-orange-200 self-start sm:ml-3">
          {prescriptions.length} pending
        </span>
      </h4>
      
      {/* Enhanced prescription cards */}
      <div className="space-y-2 sm:space-y-3">
        {prescriptions.map((presc) => {
          // Check if prescription is expired or expiring soon
          const now = new Date();
          const expiry = new Date(presc.expirationDate);
          const isExpired = expiry < now;
          const isExpiringSoon = !isExpired && (expiry.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
          
          return (            <div key={presc._id} className="bg-white dark:bg-[#58383E] rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
              {/* Medicine header with status */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 sm:gap-0">
                <div className="font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] text-base sm:text-lg break-words">
                  {presc.medicineType}
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isExpired ? (
                    <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                      ⚠️ Expired
                    </span>
                  ) : isExpiringSoon ? (
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                      ⏰ Expiring Soon
                    </span>
                  ) : (
                    <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                      ✅ Valid
                    </span>
                  )}
                </div>
              </div>
              
              {/* Desktop grid view */}
              <div className="hidden sm:grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Quantity:</span>
                  <div className="font-semibold dark:text-gray-100">{presc.quantity}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Issued:</span>
                  <div className="dark:text-gray-100">{new Date(presc.issueDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Expires:</span>
                  <div className={isExpired ? 'text-red-600 dark:text-red-400 font-medium' : isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'dark:text-gray-100'}>
                    {new Date(presc.expirationDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Referral:</span>
                  <div className="dark:text-gray-100">{presc.referralType}</div>
                </div>
              </div>              {/* Mobile stacked view */}
              <div className="sm:hidden space-y-3 text-sm">
                {/* Quantity and Referral in first row */}
                <div className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center text-xs">
                      <span className="mr-2">📦</span>Quantity:
                    </span>
                    <span className="font-semibold dark:text-gray-100 text-xs">
                      {presc.quantity}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center text-xs">
                      <span className="mr-2">🏥</span>Referral:
                    </span>
                    <span className="dark:text-gray-100 text-xs break-words">
                      {presc.referralType}
                    </span>
                  </div>
                </div>
                
                {/* Dates in second row */}
                <div className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center text-xs">
                      <span className="mr-2">📅</span>Issued:
                    </span>
                    <span className="dark:text-gray-100 text-xs">
                      {new Date(presc.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center text-xs">
                      <span className="mr-2">⏳</span>Expires:
                    </span>
                    <span className={`text-xs font-medium ${
                      isExpired 
                        ? 'text-red-600 dark:text-red-400' 
                        : isExpiringSoon 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'dark:text-gray-100'
                    }`}>
                      {new Date(presc.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrescriptionList;
