import React, { useEffect, useState } from "react";
import { Treatment } from "../../types";

interface PetLastTreatmentProps {
  petId: string;
}

const PetLastTreatment: React.FC<PetLastTreatmentProps> = ({ petId }) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/treatments/pet/${petId}/sorted`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setTreatments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("No treatment found");
        setLoading(false);
      });
  }, [petId]);

  if (loading) return <div className="text-gray-500">Loading last treatment...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!treatments.length) return <div className="text-gray-500">No treatments found.</div>;

  const treatment = treatments[0];

  return (
    <div className="bg-gray-50 rounded-lg shadow p-4 mt-2 w-full">
      <h4 className="font-bold mb-2 text-[#664147] text-lg">Last Treatment</h4>
      <div className="space-y-2 text-base">
        <div><span className="font-semibold">Date:</span> {new Date(treatment.visitDate).toLocaleDateString()} {treatment.visitTime}</div>
        <div><span className="font-semibold">Type:</span> {treatment.treatmentType}</div>
        <div><span className="font-semibold">Cost:</span> {treatment.cost}₪</div>
        <div><span className="font-semibold">Category:</span> {treatment.visitationCategory}</div>
        <div><span className="font-semibold">Notes:</span> {treatment.notes}</div>
      </div>
    </div>
  );
};

export default PetLastTreatment;
