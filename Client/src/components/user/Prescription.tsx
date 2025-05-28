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
        setPrescriptions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load prescriptions");
        setLoading(false);
      });
  }, [prescriptionIds]);

  if (loading) return <div className="text-gray-500">Loading prescriptions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!prescriptions.length) return <div className="text-gray-500">No prescriptions found.</div>;

  return (
    <div className="bg-gray-50 rounded-lg shadow p-4 mt-2">
      <h4 className="font-bold mb-2 text-[#664147]">Prescriptions</h4>
      <ul className="space-y-2">
        {prescriptions.map((presc) => (
          <li key={presc._id} className="border-b pb-2 last:border-b-0">
            <div className="grid grid-cols-5 gap-4 text-sm md:text-base">
              <div>
                <span className="font-semibold"></span> {presc.medicineType}
              </div>
              <div>
                <span className="font-semibold">Qty:</span> {presc.quantity}
              </div>
              <div>
                <span className="font-semibold">Issued:</span> {new Date(presc.issueDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Expires:</span> {new Date(presc.expirationDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Fulfilled:</span> {presc.fulfilled ? "Yes" : "No"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PrescriptionList;
