import React, { useState } from "react";
import EditUserProfile from "./EditUserProfile";

interface Pet {
  name: string;
  breed: string;
}

interface Client {
  username: string;
  email: string;
  pets: Pet[];
}

const defaultClient: Client = {
  username: "Ilan Tavori",
  email: "ilan@example.com",
  pets: [
    { name: "Tommy", breed: "Labrador" },
    { name: "Lucy", breed: "Persian Cat" },
  ],
};

const ClientProfile: React.FC = () => {
  const [client, setClient] = useState<Client>(defaultClient);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState("123-456-7890");
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleEditSave = (data: { email: string; phone: string }) => {
    setEmail(data.email);
    setPhone(data.phone);
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="relative">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {isEditing ? (
          <EditUserProfile
            initialEmail={email}
            initialPhone={phone}
            onSave={handleEditSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{client.username}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Edit
              </button>
            </div>

            <div className="text-gray-700 mb-4">
              <p>Email: {email}</p>
              <p>Phone: {phone}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Pets:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {client.pets.map((pet, index) => (
                  <li key={index}>
                    <strong>{pet.name}</strong> — {pet.breed}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          Profile updated successfully!
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
