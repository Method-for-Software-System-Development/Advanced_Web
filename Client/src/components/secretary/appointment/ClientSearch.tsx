import React, { useState } from 'react';
import { Patient } from '../../../types';
import { patientService } from '../../../services/patientService';  

interface ClientSearchProps {
  onClientSelect: (client: Patient) => void;
  selectedClient: Patient | null;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ onClientSelect, selectedClient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSelectClient = (client: Patient) => {
    onClientSelect(client);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="border-b pb-4 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 dark:text-[#FDF6F0]">Client Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Search Client (Name, Email, Phone)
        </label>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
        />
        {isLoading && <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>}
        
        {searchResults.length > 0 && (
          <ul className="mt-2 border border-gray-300 rounded-md shadow-lg bg-white max-h-60 overflow-y-auto dark:border-gray-600 dark:bg-gray-700">
            {searchResults.map((client) => (
              <li
                key={client._id}
                onClick={() => handleSelectClient(client)}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-200 last:border-b-0 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-200"
              >
                {client.firstName} {client.lastName} ({client.email})
              </li>
            ))}
          </ul>
        )}
        {!isLoading && searchQuery && searchResults.length === 0 && (
          <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No clients found matching your search.</p>
        )}
      </div>

      {selectedClient && (
        <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-[#FDF6F0]">{selectedClient.firstName} {selectedClient.lastName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{selectedClient.email}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{selectedClient.phone}</p>
          <button
            onClick={() => { setSearchQuery(''); setSearchResults([]); onClientSelect(null as any); }}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientSearch;
