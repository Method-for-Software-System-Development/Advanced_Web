import React from 'react';

// Assuming Pet and Patient interfaces are defined in a shared types file or passed as props
// For now, let's redefine them here for clarity, but ideally, they should be imported.
interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
}

interface Patient {
  id: string;
  ownerName: string;
  contact: string;
  pets: Pet[];
}

interface PatientCardProps {
  patient: Patient;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-semibold text-[#664147] mb-2">{patient.ownerName}</h3>
      <p className="text-sm text-gray-600 mb-3">Contact: {patient.contact}</p>
      <h4 className="text-md font-semibold text-gray-700 mb-2">Pets:</h4>
      {patient.pets.length > 0 ? (
        <ul className="list-disc list-inside pl-4 space-y-1 text-sm text-gray-700">
          {patient.pets.map(pet => (
            <li key={pet.id}>
              <strong>{pet.name}</strong> ({pet.species})
              {pet.breed && `, ${pet.breed}`}
              {pet.age !== undefined && `, Age: ${pet.age}`}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">No pets registered for this owner.</p>
      )}
      {/* TODO: Add buttons for Edit Patient, Delete Patient here if needed at this level */}
    </div>
  );
};

export default PatientCard;
