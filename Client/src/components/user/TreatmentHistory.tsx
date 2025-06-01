import React, { useEffect, useState } from "react";
import TreatmentCard from "./TreatmentCard";

const TreatmentHistory: React.FC = () => {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const clientRaw = localStorage.getItem("client");
        if (!clientRaw) {
          return;
        }

        const client = JSON.parse(clientRaw);
        // Support both array of pet objects and array of pet IDs
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

        if (petIds.length === 0) {
          return;
        }

        // Fetch all treatments for all petIds in one request
        const res = await fetch("http://localhost:3000/api/treatments/byPetIds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ petIds }),
        });
        const treatmentsData = res.ok ? await res.json() : [];

        // If we don't have pet names, fetch them
        if (Object.keys(petIdToName).length !== petIds.length) {
          // Fetch all pets in parallel
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

        // Attach petName to each treatment (no date filter)
        const allTreatments = treatmentsData
          .map((t: any) => ({ ...t, petName: petIdToName[t.petId] || "Unknown" }));

        // Fetch vet names for unique vetIds
        const uniqueVetIds = Array.from(new Set(allTreatments.map((t: any) => t.vetId)));
        const vetIdToName = new Map<string, string>();
        await Promise.all(
          uniqueVetIds.map(async (vetId) => {
            if (!vetId) return;
            const vetIdStr = vetId.toString();
            try {
              const vetRes = await fetch(`http://localhost:3000/api/staff/${vetIdStr}`);
              const vet = vetRes.ok ? await vetRes.json() : null;
              if (vet && vet.firstName && vet.lastName) {
                vetIdToName.set(vetIdStr, `${vet.firstName} ${vet.lastName}`);
              } else if (vet && vet.name) {
                vetIdToName.set(vetIdStr, vet.name);
              } else {
                vetIdToName.set(vetIdStr, "Unknown Vet");
              }
            } catch {
              vetIdToName.set(vetIdStr, "Unknown Vet");
            }
          })
        );

        // Attach vetName to each treatment
        const allTreatmentsWithVet = allTreatments.map((t: any) => ({
          ...t,
          vetName: vetIdToName.get(t.vetId?.toString()) || t.vetId?.toString() || "Unknown Vet"
        }));
        setTreatments(allTreatmentsWithVet);
      } catch (error) {
        console.error("Error fetching treatments:", error);
      }
    };

    fetchTreatments();
  }, []);

  const filtered = treatments.filter((t) =>
    t.petName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Split treatments into upcoming and past
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const currentTime = now.toTimeString().slice(0, 5); // 'HH:MM'

  const upcoming = filtered.filter(t => {
    if (!t.visitDate) return false;
    if (t.visitDate > todayStr) return true;
    if (t.visitDate === todayStr && t.visitTime && t.visitTime > currentTime) return true;
    return false;
  });

  const past = filtered.filter(t => {
    if (!t.visitDate) return false;
    if (t.visitDate < todayStr) return true;
    if (t.visitDate === todayStr && t.visitTime && t.visitTime <= currentTime) return true;
    return false;
  });

  return (
    <div className="flex justify-center w-full min-h-[600px]">
      <div
        className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-10 flex flex-col gap-10 mt-8"
        style={{ width: "80%" }}
      >
        <h2 className="text-3xl font-bold text-[var(--color-wine)] mb-6">Treatment History</h2>

        {/* Search Input */}
        <div className="mb-8 px-2">
          <label htmlFor="searchPatients" className="block text-sm font-medium text-gray-700 mb-1">
            Search by Pet Name
          </label>
          <input
            type="text"
            id="searchPatients"
            placeholder="Enter pet name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Render all treatments (filtered) */}
        <div className="mb-2 text-gray-700 font-medium">
          Showing {filtered.length} treatment{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Upcoming treatments */}
        <h3 className="text-xl font-semibold mt-4" style={{ color: 'var(--color-skyDark)' }}>Upcoming Treatments:</h3>
        <div className="space-y-6 mb-8">
          {upcoming.length > 0 ? (
            upcoming.map((t, index) => (
              <TreatmentCard
                key={t._id || `upcoming-${index}`}
                petName={t.petName}
                visitDate={t.visitDate}
                vetName={t.vetName}
                visitationType={t.visitationType}
                cost={t.cost}
                notes={t.notes}
              />
            ))
          ) : (
            <p className="text-center text-[var(--color-greyText)]">No upcoming treatments.</p>
          )}
        </div>

        {/* Past treatments */}
        <h3 className="text-xl font-semibold mt-4" style={{ color: 'var(--color-skyDark)' }}>Past Treatments:</h3>
        <div className="space-y-6">
          {past.length > 0 ? (
            past.map((t, index) => (
              <TreatmentCard
                key={t._id || `past-${index}`}
                petName={t.petName}
                visitDate={t.visitDate}
                vetName={t.vetName}
                visitationType={t.visitationType}
                cost={t.cost}
                notes={t.notes}
              />
            ))
          ) : (
            <p className="text-center text-[var(--color-greyText)]">No past treatments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentHistory;
