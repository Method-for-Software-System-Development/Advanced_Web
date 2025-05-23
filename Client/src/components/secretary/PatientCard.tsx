import React from 'react';
import { Patient } from '../../types'; // Import Patient type

interface PatientCardProps {
  patient: Patient;
  onEditPatient: (patient: Patient) => void; // Add onEditPatient prop
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onEditPatient }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-[#664147]">{patient.ownerName}</h3>
        <button 
          onClick={() => onEditPatient(patient)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Edit
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-1">Contact: {patient.contact}</p>
      {patient.phone && <p className="text-sm text-gray-600 mb-3">Phone: {patient.phone}</p>} {/* Display phone if available */}
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
    </div>
  );
};

export default PatientCard;
