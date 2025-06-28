import React, { useEffect, useState } from "react";
import UserInformationCard from "./UserInformationCard";
import EditUserProfile from "./EditUserProfile";
import PetCard from "./PetCard";
import { userService } from "../../services/userService";
import { Pet } from "../../types";
import { API_URL } from '../../config/api';
import TutorialModal from "./TutorialModal";

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  street: string;
  postalCode?: string;
  pets: string[]; // Array of pet IDs
  //hasPets: boolean;
  
}

const ClientProfile: React.FC = () => {  const [client, setClient] = useState<Client | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPetsLoading, setIsPetsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [petsError, setPetsError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showInactivePets, setShowInactivePets] = useState(false);
// Tutorial modal state – controls whether the tutorial is currently open
const [tutorialOpen, setTutorialOpen] = useState(false);
 /**
 * Auto-open the tutorial only when BOTH are true:
 *   1. We already finished loading pets  (isPetsLoading === false)
 *   2. The logged-in client truly has no pet IDs (client.pets.length === 0)
 *
 * Rationale:
 * While the pets request is still in flight, the local `pets` array is empty,
 * which previously triggered the modal even for users who *do* have pets.
 * By checking the client’s IDs instead, we avoid that flash.
 */
useEffect(() => {
  if (!isPetsLoading && client) {
    if (client.pets.length === 0) {
      setTutorialOpen(true);   // open tutorial only when the user has no pets
    }
  }
}, [client, isPetsLoading]);
  // Function to show success message with auto-dismiss
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000); // Auto-dismiss after 3 seconds
  };

  // Function to retry loading pets
  const retryLoadPets = () => {
    setPetsError(null);
    // Re-trigger the useEffect by setting client to itself
    if (client) {
      const tempClient = { ...client };
      setClient(tempClient);
    }
  };

  // Load client from localStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("client");
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

    // Check if pets are already populated (Pet objects) or just IDs (strings)
    const firstPet = client.pets[0];
    if (typeof firstPet === 'object' && firstPet && '_id' in firstPet) {
      // Pets are already populated as Pet objects
      setPets(client.pets as unknown as Pet[]);
      setIsPetsLoading(false);
      return;
    }

    // Pets are just ID strings, need to fetch full pet data
    const petIds = client.pets as string[]; // Cast to string array for ID case
    const validPetIds = petIds.filter(id => typeof id === "string" && id.length === 24);
    if (validPetIds.length === 0) {
      setPets([]);
      return;
    }

    setIsPetsLoading(true);
    setPetsError(null);
    
    fetch(`${API_URL}/pets/byIds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: validPetIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPets(Array.isArray(data) ? data : []);
        if (!Array.isArray(data)) {
          console.error("Expected array from /api/pets/byIds, got:", data);
          setPetsError("Unexpected response format from server");
        }
        // Debug: log the response
      })
      .catch((err) => {
        setPets([]);
        setPetsError("Failed to load pet information. Please try again.");
        console.error("Error fetching pets:", err);
      })
      .finally(() => {
        setIsPetsLoading(false);
      });
  }, [client]);  const handleEditSave = async (data: { 
    email: string; 
    phone: string; 
    city: string; 
    street?: string; 
    postalCode?: string; 
  }) => {
    if (!client) {
      setError("No client information available");
      return;
    }
   


    console.log("ClientProfile received data to save:", data); // Debug log
    console.log("Current postalCode in client:", client.postalCode); // Debug log

    setIsLoading(true);
    setError(null);

    try {
      // Call the API to update user profile
      const response = await userService.updateUser(client._id, {
        email: data.email,
        phone: data.phone,
        city: data.city,
        street: data.street,
        postalCode: data.postalCode
      });

      // Update local state only after successful API call
      setEmail(data.email);
      setPhone(data.phone);
      setIsEditing(false);
        // Update client in localStorage with the updated data
      const updatedClient = { 
        ...client, 
        email: data.email, 
        phone: data.phone,
        city: data.city || client.city, // Use existing value if not provided
        street: data.street || client.street, // Use existing value if not provided
        postalCode: data.postalCode
      };
      setClient(updatedClient);
      sessionStorage.setItem("client", JSON.stringify(updatedClient));

      // Show success message
      showSuccessMessage("Profile updated successfully!");

    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error instanceof Error ? error.message : "Failed to update profile");
      // Don't close editing mode if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  if (!client) return <div>Loading...</div>;
  return (
    <div className="flex justify-center w-full">
      <div
        className="p-6 bg-white dark:bg-darkModeLight rounded-lg shadow-xl max-w-7xl mx-auto"
        style={{ width: "100%" }}
      >

        {/* --- User Info Card --- */}
        <UserInformationCard
          firstName={client.firstName}
          lastName={client.lastName}
          email={email}
          phone={phone}
          city={client.city}
          street={client.street}
          postalCode={client.postalCode}
          isEditing={isEditing}
          onEdit={() => {
            setError(null); // Clear any previous errors when entering edit mode
            setIsEditing(true);
          }}
          tutorialOpen={tutorialOpen}
          setTutorialOpen={setTutorialOpen}
        >          {isEditing && (
            <EditUserProfile
              initialEmail={email}
              initialPhone={phone}
              initialCity={client.city}
              initialStreet={client.street}
              initialPostalCode={client.postalCode}
              onSave={handleEditSave}
              onCancel={() => {
                setError(null); // Clear errors when canceling
                setIsEditing(false);
              }}
              isLoading={isLoading}
              error={error}
            />
          )}
        </UserInformationCard>
        <TutorialModal
    open={tutorialOpen}
    onClose={() => setTutorialOpen(false)}
     hasPets={!!client && client.pets.length > 0} 
    />
        {/* --- Pets Section --- */}
        <div>
          <div className="flex items-center justify-between mt-4 mb-4">
            <h2 className="mt-5 text-2xl font-semibold text-grayText dark:text-white mb-4 text-left">All Your Pets at a Glance:</h2>
            <div className="flex items-center gap-4">
              {/* Show inactive pets checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInactivePets"
                  checked={showInactivePets}
                  onChange={(e) => setShowInactivePets(e.target.checked)}
                  className="w-5 h-5 accent-wine"
                />
                <label htmlFor="showInactivePets" className="ml-2 text-md text-grayText dark:text-lightGrayText">
                  Show inactive pets
                </label>
              </div>
              {isPetsLoading && (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Loading pets...</span>
                </div>
              )}
            </div>
          </div>
            {petsError ? (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-600 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 dark:text-red-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 dark:text-red-200 font-medium">{petsError}</span>
              </div>
              <button
                onClick={retryLoadPets}
                className="mt-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md text-sm hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              >
                Try Again
              </button>
            </div>          ) : pets.length === 0 && !isPetsLoading ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p className="text-gray-500 dark:text-gray-300 text-lg">No pets found</p>
              <p className="text-gray-400 dark:text-gray-400 text-sm mt-1">Contact your veterinarian to add pets to your profile</p>
            </div>
          ) : (
            (() => {
              const filteredPets = pets.filter(pet => showInactivePets || pet.isActive);              return filteredPets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPets.map((pet) => (
                    <PetCard key={pet._id} pet={pet} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-300 text-lg">No active pets found</p>
                  <p className="text-gray-400 dark:text-gray-400 text-sm mt-1">Check "Show inactive pets" to see all pets, or contact your veterinarian</p>
                </div>
              );
            })()
          )}
        </div>        {/* Success Message Banner */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 dark:bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg border-l-4 border-green-700 dark:border-green-500 transition-all duration-300 ease-in-out">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
