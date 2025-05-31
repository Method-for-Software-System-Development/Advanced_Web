import React from 'react';
import { Patient } from '../../types';
import AddPetForm from './AddPetForm';

interface PatientCardProps {
  patient: Patient;
  onEditPatient: (patient: Patient) => void;
  onAddPet: (patientId: string, petName: string, petType:string, petBreed:string, petBirthYear:number, petWeight:number) => void;
  showAddPetForm: boolean;
  onToggleAddPetForm: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onEditPatient, onAddPet, showAddPetForm, onToggleAddPetForm }) => {
  const handleAddPet = (patientId: string, petName: string, petType:string, petBreed:string, petBirthYear:number, petWeight:number) => {
    onAddPet(patientId, petName, petType, petBreed, petBirthYear, petWeight);
    onToggleAddPetForm();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-[#664147]">{patient.firstName+' '+patient.lastName}</h3>
        <button 
          onClick={() => onEditPatient(patient)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Edit
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-1">Email: {patient.email} </p>
      {patient.phone && <p className="text-sm text-gray-600 mb-3">Phone: {patient.phone}</p>}
      {patient.city && <p className="text-sm text-gray-600 mb-1">City: {patient.city}</p>}
      {patient.country && <p className="text-sm text-gray-600 mb-1">Country: {patient.country}</p>}
      {patient.postalCode && <p className="text-sm text-gray-600 mb-1">Postal Code: {patient.postalCode}</p>}
      <h4 className="text-md font-semibold text-gray-700 mb-2">Pets:</h4>
      {patient.pets.length > 0 ? (
        <ul className="list-disc list-inside pl-4 space-y-1 text-sm text-gray-700">
          {patient.pets.map(pet => (
            <li key={pet._id}>
              <strong>{pet.name}</strong> ({pet.type})
              {pet.breed && `, ${pet.breed}`}
              {pet.birthYear && `, Birth Year: ${pet.birthYear}`}
              {pet.weight !== undefined && `, Weight: ${pet.weight}kg`}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 italic">No pets registered for this owner.</p>
      )}
      <button 
        onClick={onToggleAddPetForm}
        className="mt-4 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
      >
        {showAddPetForm ? 'Cancel' : 'Add New Pet'}
      </button>
      {showAddPetForm && (
        <AddPetForm
          patients={[patient]}
          selectedPatientId={patient.id}
          onAddPet={handleAddPet}
          onCancel={onToggleAddPetForm}
          onSelectPatient={() => {}}
        />
      )}
    </div>
  );
};

export default PatientCard;
