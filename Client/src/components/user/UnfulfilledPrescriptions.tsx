import React, { useEffect, useState } from "react";
import { Prescription } from "../../types";

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
    }
    setLoading(true);
    fetch("http://localhost:3000/api/prescriptions/byIds", {
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

  if (loading) return <div className="text-gray-500 text-xs sm:text-base whitespace-nowrap text-left">Loading prescriptions...</div>;
  if (error) return <div className="text-red-500 text-xs sm:text-base whitespace-nowrap text-left">{error}</div>;
  if (!prescriptions.length) return <div className="text-gray-500 text-xs sm:text-base whitespace-nowrap text-left">No prescriptions found.</div>;

  return (
    <div className="bg-gray-50 rounded-lg shadow p-4 mt-2 w-full">
      <h4 className="font-bold mb-2 text-[#664147] text-lg">Prescriptions</h4>
      {/* Table Headline Row - only shown if there are unfulfilled prescriptions */}
      <div className="hidden sm:grid grid-cols-5 gap-x-2 text-xs sm:text-base font-bold text-center text-[var(--color-wine)] mb-1">
        <span>Medicine</span>
        <span>Quantity</span>
        <span>Issued</span>
        <span>Expires</span>
        <span>Fulfilled</span>
      </div>
      <ul className="space-y-2">
        {prescriptions.map((presc) => (
          <li key={presc._id} className="border-b pb-2 last:border-b-0">
            {/* Responsive data row: grid on desktop, stacked on mobile */}
            <div className="sm:grid sm:grid-cols-5 gap-y-1 gap-x-2 text-xs sm:text-base items-center">
              {/* Mobile stacked view */}
              <div className="flex sm:hidden justify-between py-1 border-b border-gray-200">
                <span className="font-bold text-[var(--color-wine)]">Medicine:</span>
                <span className="text-right">{presc.medicineType}</span>
              </div>
              <div className="flex sm:hidden justify-between py-1 border-b border-gray-200">
                <span className="font-bold text-[var(--color-wine)]">Quantity:</span>
                <span className="text-right">{presc.quantity}</span>
              </div>
              <div className="flex sm:hidden justify-between py-1 border-b border-gray-200">
                <span className="font-bold text-[var(--color-wine)]">Issued:</span>
                <span className="text-right">{new Date(presc.issueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex sm:hidden justify-between py-1 border-b border-gray-200">
                <span className="font-bold text-[var(--color-wine)]">Expires:</span>
                <span className="text-right">{new Date(presc.expirationDate).toLocaleDateString()}</span>
              </div>
              <div className="flex sm:hidden justify-between py-1">
                <span className="font-bold text-[var(--color-wine)]">Fulfilled:</span>
                <span className="text-right">{presc.fulfilled ? "Yes" : "No"}</span>
              </div>
              {/* Desktop/tablet grid view */}
              <span className="hidden sm:block whitespace-nowrap text-center">{presc.medicineType}</span>
              <span className="hidden sm:block text-center">{presc.quantity}</span>
              <span className="hidden sm:block text-center">{new Date(presc.issueDate).toLocaleDateString()}</span>
              <span className="hidden sm:block text-center">{new Date(presc.expirationDate).toLocaleDateString()}</span>
              <span className="hidden sm:block text-center">{presc.fulfilled ? "Yes" : "No"}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PrescriptionList;
