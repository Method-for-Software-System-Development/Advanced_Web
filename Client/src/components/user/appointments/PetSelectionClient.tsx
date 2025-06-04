import React from 'react';
import { Pet } from '../../../types';

interface PetSelectionClientProps {
  pets: Pet[];
  selectedPetId: string | null;
  onPetSelect: (petId: string) => void;
  clientName: string;
}

const PetSelectionClient: React.FC<PetSelectionClientProps> = ({
  pets,
  selectedPetId,
  onPetSelect,
  clientName
}) => {  if (pets.length === 0) {
    return (
      <div className="border-b pb-4 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 dark:text-[#FDF6F0]">Pet Information</h3>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900 dark:border-yellow-600">
          <p className="text-yellow-800 dark:text-yellow-200">
            No pets found for {clientName}. Please add a pet to their profile first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b pb-4 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 dark:text-[#FDF6F0]">Pet Information</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Select Pet *
        </label>
        <div className="space-y-2">
          {pets.map(pet => (            <label key={pet._id} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer dark:border-gray-600 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="selectedPet"
                value={pet._id}
                checked={selectedPetId === pet._id}
                onChange={() => onPetSelect(pet._id)}
                className="text-[#EF92A6] focus:ring-[#EF92A6]"
              />
              <div className="flex-1">
                <span className="font-medium dark:text-gray-200">{pet.name}</span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  ({pet.type}) - {pet.breed}
                </span>
                {pet.birthYear && (
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    Born: {pet.birthYear}
                  </span>
                )}
                {pet.weight && (
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    Weight: {pet.weight}kg
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetSelectionClient;
