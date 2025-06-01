import React, { useState } from 'react';
import { User } from '../../../types';
import userService from '../../../services/userService';

interface ClientSearchProps {
  onClientSelect: (client: User) => void;
  selectedClient: User | null;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ onClientSelect, selectedClient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      setIsLoading(true);
      try {
        const results = await userService.searchUsers(query);
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

  const handleSelectClient = (client: User) => {
    onClientSelect(client);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Client Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Client (Name, Email, Phone)
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Start typing to search..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF92A6]"
        />
        {isLoading && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
        
        {searchResults.length > 0 && (
          <ul className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto bg-white shadow-lg z-10">
            {searchResults.map(client => (
              <li
                key={client._id}
                onClick={() => handleSelectClient(client)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {client.firstName} {client.lastName} ({client.email})
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedClient && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-md font-semibold text-gray-700">Selected Client:</h4>
          <p className="text-sm text-gray-600"><strong>Name:</strong> {selectedClient.firstName} {selectedClient.lastName}</p>
          <p className="text-sm text-gray-600"><strong>Email:</strong> {selectedClient.email}</p>
          <p className="text-sm text-gray-600"><strong>Phone:</strong> {selectedClient.phone}</p>
        </div>
      )}
    </div>
  );
};

export default ClientSearch;
