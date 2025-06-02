import React, { useEffect, useState } from "react";
import { Prescription } from "../../types";
import PrescriptionCard from "./PrescriptionCard";
import UserNavButton from "./UserNavButton";

const ShowPrescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<(Prescription & { petName?: string; treatmentType?: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnfulfilledOnly, setShowUnfulfilledOnly] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const clientRaw = localStorage.getItem("client");
        if (!clientRaw) return;
        const client = JSON.parse(clientRaw);
        let petIds: string[] = [];
        let petIdToName: Record<string, string> = {};
        if (Array.isArray(client.pets)) {
          if (typeof client.pets[0] === "object" && client.pets[0]?._id) {
            petIds = client.pets.map((p: any) => p._id);
            client.pets.forEach((p: any) => { petIdToName[p._id] = p.name; });
          } else {
            petIds = client.pets;
          }
        }
        // Fetch all prescriptions for all petIds
        if (petIds.length === 0) return;
        const res = await fetch("http://localhost:3000/api/prescriptions/byPetIds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ petIds }),
        });
        if (!res.ok) {
          setPrescriptions([]);
          return;
        }
        const prescriptionsData = await res.json();
        if (!Array.isArray(prescriptionsData) || prescriptionsData.length === 0) {
          setPrescriptions([]);
          return;
        }
        // If we don't have pet names, fetch them
        if (Object.keys(petIdToName).length !== petIds.length) {
          const petResults = await Promise.all(
            petIds.map(async (id) => {
              if (petIdToName[id]) return { _id: id, name: petIdToName[id] };
              const petRes = await fetch(`http://localhost:3000/api/pets/${id}`);
              const pet = petRes.ok ? await petRes.json() : null;
              return { _id: id, name: pet?.name || "Unknown" };
            })
          );
          petResults.forEach((p) => { petIdToName[p._id] = p.name; });
        }
        // Attach petName to each prescription
        const allPrescriptions = prescriptionsData.map((p: any) => ({
          ...p,
          petName: petIdToName[p.petId] || "Unknown",
          treatmentType: p.treatmentType || undefined // If available
        }));
        setPrescriptions(allPrescriptions);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    };
    fetchPrescriptions();
  }, []);

  // Filter by treatment type or pet name
  const filtered = prescriptions.filter((p) =>
    (p.treatmentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medicineType?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!showUnfulfilledOnly || !p.fulfilled)
  );

  return (
    <div className="flex justify-center w-full min-h-[600px]">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-10 flex flex-col gap-10 mt-8" style={{ width: "80%" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-[var(--color-wine)]">Prescription History</h2>
          <UserNavButton
            label={showUnfulfilledOnly ? "Show All" : "Show Unfulfilled Only"}
            onClick={() => setShowUnfulfilledOnly((v) => !v)}
          />
        </div>
        {/* Search Input */}
        <div className="mb-8 px-2">
          <label htmlFor="searchPrescriptions" className="block text-sm font-medium text-gray-700 mb-1">
            Search by Treatment, Pet, or Medicine
          </label>
          <input
            type="text"
            id="searchPrescriptions"
            placeholder="Enter treatment type, pet name, or medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full px-6 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
          />
        </div>
        <div className="mb-2 text-gray-700 font-medium" style={{ color: 'var(--color-skyDark)' }}>
          Showing {filtered.length} prescription{filtered.length !== 1 ? 's' : ''}
        </div>
        {/* Prescriptions List */}
        <div className="space-y-6">
          {filtered.length > 0 ? (
            filtered.map((p, index) => (
              <div key={p._id || index}>
                <div className="mb-2 text-lg font-semibold text-[#664147]">
                  {p.petName ? `${p.petName}` : ""}
                  {p.treatmentType ? ` - ${p.treatmentType}` : ""}
                </div>
                <PrescriptionCard prescription={p} />
              </div>
            ))
          ) : (
            <p className="text-center text-[var(--color-greyText)]">No prescriptions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowPrescriptions;
