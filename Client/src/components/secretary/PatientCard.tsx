import React, { useState } from 'react';
import { Patient } from '../../types';
import AddPetForm from './AddPetForm';
import EditPetForm from './EditPetForm';

/** Props for patient card component with pet management functionality */
interface PatientCardProps {
  patient: Patient;
  onEditPatient: (patient: Patient) => void;
  onAddPet: (patientId: string, petName: string, petType:string, petBreed:string, petBirthYear:number, petWeight:number, sex: string, isActive: boolean) => void;
  onEditPet: (petId: string, petData: any) => void;
  showAddPetForm: boolean;
  showEditPetForm: boolean;
  onToggleAddPetForm: () => void;
  onToggleEditPetForm: () => void;
}

/** Patient card component displaying patient info and pet management with filtering */
const PatientCard: React.FC<PatientCardProps> = ({ 
  patient, 
  onEditPatient, 
  onAddPet, 
  onEditPet,
  showAddPetForm, 
  showEditPetForm,
  onToggleAddPetForm,
  onToggleEditPetForm 
}) => {
  const [showInactivePets, setShowInactivePets] = useState(true);
  
  /** Handles pet addition and closes the add pet form */
  const handleAddPet = (patientId: string, petName: string, petType:string, petBreed:string, petBirthYear:number, petWeight:number, sex: string, isActive: boolean) => {
    onAddPet(patientId, petName, petType, petBreed, petBirthYear, petWeight, sex, isActive);
    onToggleAddPetForm();
  };

  /** Handles pet editing and closes the edit pet form */
  const handleEditPet = (petId: string, petData: any) => {
    onEditPet(petId, petData);
    onToggleEditPetForm();
  };
  
  return (
    <div className="p-6 bg-gray-50 dark:bg-darkMode rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-wine dark:text-white">{patient.firstName+' '+patient.lastName}</h3>
        <button 
          onClick={() => onEditPatient(patient)}
          className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 text-sm"
        >
          Edit Patient
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Email: {patient.email} </p>
      {patient.phone && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Phone: {patient.phone}</p>}
      {patient.street && <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Street: {patient.street}</p>}
      {patient.city && <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">City: {patient.city}</p>}      {patient.postalCode && <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Postal Code: {patient.postalCode}</p>}
      <div className="border-t mt-2 flex justify-between items-center mb-2">
        <h4 className="text-md mt-2 font-semibold text-gray-700 dark:text-gray-300">Pets:</h4>
        <div className="flex mt-2 items-center space-x-2">
          <input
            type="checkbox"
            id={`showInactive-${patient._id}`}
            checked={showInactivePets}
            onChange={(e) => setShowInactivePets(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor={`showInactive-${patient._id}`} className="text-sm text-gray-600 dark:text-gray-300">
            Show inactive pets
          </label>
        </div>
      </div>
        {patient.pets && patient.pets.length > 0 ? (
        (() => {
          const filteredPets = patient.pets.filter(pet => showInactivePets || pet.isActive)
            .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
          return filteredPets.length > 0 ? (
            <ul className="list-disc list-inside pl-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {filteredPets.map(pet => (
                <li key={pet._id}>
                  <strong>{pet.name}</strong> ({pet.type})
                  {pet.breed && `, Breed: ${pet.breed}`}
                  {pet.sex && `, Sex: ${pet.sex}`}
                  {pet.birthYear && `, Birth Year: ${pet.birthYear}`}
                  {pet.weight !== undefined && `, Weight: ${pet.weight}kg`}
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    pet.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {pet.isActive ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No active pets to display. Check "Show inactive pets" to see all pets.</p>
          );
        })()
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No pets registered for this owner.</p>
      )}
      <button 
        onClick={onToggleAddPetForm}
        className="mt-4 mr-2 px-3 py-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 text-sm"
      >
        {showAddPetForm ? 'Cancel' : 'Add New Pet'}
      </button>
      {patient.pets && patient.pets.length > 0 && (
        <button 
          onClick={onToggleEditPetForm}
          className="mt-4 px-3 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded hover:bg-orange-600 dark:hover:bg-orange-700 text-sm"
        >
          {showEditPetForm ? 'Cancel' : 'Edit Pet'}
        </button>
      )}      {showAddPetForm && (
        <AddPetForm
          selectedPatientId={patient._id}
          selectedPatientName={`${patient.firstName} ${patient.lastName}`}
          onAddPet={handleAddPet}
          onCancel={onToggleAddPetForm}
        />
      )}
      {showEditPetForm && (
        <EditPetForm
          patientName={`${patient.firstName} ${patient.lastName}`}
          pets={patient.pets}
          onEditPet={handleEditPet}
          onCancel={onToggleEditPetForm}
        />
      )}
    </div>
  );
};

export default PatientCard;
