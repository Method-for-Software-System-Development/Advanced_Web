import React, { useEffect, useState } from "react";
import UserInformationCard from "./UserInformationCard";
import EditUserProfile from "./EditUserProfile";
import PetCard from "./PetCard";

interface Pet {
  _id: string;
  name: string;
  type: string;
  breed: string;
  birthYear: number;
  weight: number;
  prescriptions: string[];
  treatments: string[];
}

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  pets: string[]; // Array of pet IDs
}

const ClientProfile: React.FC = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Load client from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("client");
    if (stored) {
      const user = JSON.parse(stored);
      setClient(user);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, []);

  // Fetch full pets by IDs once client is loaded
  useEffect(() => {
    if (!client || !Array.isArray(client.pets) || client.pets.length === 0) {
      setPets([]);
      return;
    }
    // Only send valid 24-char ObjectID strings
    const validPetIds = client.pets.filter(id => typeof id === "string" && id.length === 24);
    if (validPetIds.length === 0) {
      setPets([]);
      return;
    }
    fetch("http://localhost:3000/api/pets/byIds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: validPetIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPets(Array.isArray(data) ? data : []);
        if (!Array.isArray(data)) {
          console.error("Expected array from /api/pets/byIds, got:", data);
        }
        // Debug: log the response
        console.log("Response from /api/pets/byIds:", data);
      })
      .catch((err) => {
        setPets([]);
        console.error("Error fetching pets:", err);
      });
  }, [client]);
  
  const handleEditSave = (data: { email: string; phone: string }) => {
    setEmail(data.email);
    setPhone(data.phone);
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Optionally update client in localStorage
    if (client) {
      const updatedClient = { ...client, email: data.email, phone: data.phone };
      setClient(updatedClient);
      localStorage.setItem("client", JSON.stringify(updatedClient));
    }
  };

  if (!client) return <div>Loading...</div>;

  return (
    <div className="flex justify-center w-full min-h-[600px]">
      <div
        className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-10 flex flex-col gap-10 mt-8"
        style={{ width: "100%" }}
      >
        {/* --- User Info Card --- */}
        <UserInformationCard
          firstName={client.firstName}
          lastName={client.lastName}
          email={email}
          phone={phone}
          city={client.city}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
        >
          {isEditing && (
            <EditUserProfile
              initialEmail={email}
              initialPhone={phone}
              onSave={handleEditSave}
              onCancel={() => setIsEditing(false)}
            />
          )}
        </UserInformationCard>

        {/* --- Pets Section --- */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Pets</h3>
          {pets.length === 0 ? (
            <p className="text-gray-500">No pets found.</p>
          ) : (
            <ul className="flex flex-wrap gap-6">
              {pets.map((pet) => (
                <PetCard key={pet._id} pet={pet} />
              ))}
            </ul>
          )}
        </div>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 text-base mobile-toast-text">
            Profile updated successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
