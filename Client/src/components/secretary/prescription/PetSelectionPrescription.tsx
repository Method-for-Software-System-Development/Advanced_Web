import React from 'react';
import { Pet } from '../../../types';

/** Props for pet selection component in prescription workflow */
interface PetSelectionPrescriptionProps {
  pets: Pet[];
  selectedPetId: string | null;
  onPetSelect: (petId: string) => void;
  clientName: string;
}

/** Pet selection component for prescription management with radio button interface */
const PetSelectionPrescription: React.FC<PetSelectionPrescriptionProps> = ({ 
  pets, 
  selectedPetId, 
  onPetSelect, 
  clientName 
}) => {
  return (
    <div className="border-b pb-4 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 dark:text-[#FDF6F0]">Pet Information</h3>
      <div className="mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Select a pet for <strong>{clientName}</strong>
        </p>
      </div>
        {pets.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            No active pets found for this patient. Only active pets can be prescribed medication.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pets.map(pet => (
            <label 
              key={pet._id} 
              className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${
                selectedPetId === pet._id 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-600' 
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                name="selectedPet"
                value={pet._id}
                checked={selectedPetId === pet._id}
                onChange={() => onPetSelect(pet._id)}
                className="text-green-600 focus:ring-green-500 dark:text-green-400 dark:focus:ring-green-400"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {pet.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {pet.type} • {pet.breed}
                  {pet.birthYear && ` • Born ${pet.birthYear}`}
                  {pet.weight && ` • ${pet.weight}kg`}
                  {pet.sex && ` • ${pet.sex}`}
                </div>
                <div className={`text-xs mt-1 ${
                  pet.isActive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {pet.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetSelectionPrescription;
