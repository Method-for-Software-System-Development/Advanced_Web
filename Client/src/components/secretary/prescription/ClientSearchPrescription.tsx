import React, { useState } from 'react';
import { Patient } from '../../../types';
import { patientService } from '../../../services/patientService';  

/** Props for patient search component used in prescription management */
interface ClientSearchPrescriptionProps {
  onClientSelect: (client: Patient) => void;
  selectedClient: Patient | null;
}

/** Patient search component for prescription management with real-time search and selection */
const ClientSearchPrescription: React.FC<ClientSearchPrescriptionProps> = ({ onClientSelect, selectedClient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /** Searches patients by name, email, or phone when query length > 1 */
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      setIsLoading(true);
      try {
        const results = await patientService.searchPatients(query);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching clients:', err);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  /** Selects a patient and clears search results */
  const handleSelectClient = (client: Patient) => {
    onClientSelect(client);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="border-b pb-4 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 dark:text-[#FDF6F0]">Patient Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Search Patient (Name, Email, Phone) *
        </label>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
        />
        {isLoading && <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
        
        {searchResults.length > 0 && (
          <ul className="mt-2 border border-gray-300 rounded-md shadow-lg bg-white max-h-60 overflow-y-auto dark:border-gray-600 dark:bg-gray-700">
            {searchResults.map((client) => (
              <li
                key={client._id}
                onClick={() => handleSelectClient(client)}
                className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-200 last:border-b-0 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200"
              >
                <div className="font-medium">{client.firstName} {client.lastName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{client.email} • {client.phone}</div>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && searchQuery && searchResults.length === 0 && (
          <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No patients found matching your search.</p>
        )}
      </div>

      {selectedClient && (
        <div className="mt-4 p-4 border border-green-300 rounded-md bg-green-50 dark:border-green-600 dark:bg-green-900/30">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-[#FDF6F0]">
                {selectedClient.firstName} {selectedClient.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{selectedClient.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{selectedClient.phone}</p>              
              {selectedClient.pets && selectedClient.pets.length > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {(() => {
                    const activePets = selectedClient.pets.filter(pet => 
                      typeof pet === 'object' && pet !== null && pet.isActive === true
                    );
                    return `${activePets.length} available pet${activePets.length !== 1 ? 's' : ''}`;
                  })()}
                </p>
              )}
            </div>
            <button
              onClick={() => { 
                setSearchQuery(''); 
                setSearchResults([]); 
                onClientSelect(null as any); 
              }}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSearchPrescription;
