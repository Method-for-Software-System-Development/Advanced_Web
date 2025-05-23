import React, { useState } from 'react';
import PatientList from './PatientList';
import AddPatientForm from './AddPatientForm';
import AddPetForm from './AddPetForm';

// Define the structure of Pet and Patient (ideally imported from a shared types file)
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

// Mock data - replace with actual API call in a real application
const mockPatients: Patient[] = [
  {
    id: 'p1',
    ownerName: 'John Doe',
    contact: 'john.doe@example.com',
    pets: [
      { id: 'pet1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: 5 },
      { id: 'pet2', name: 'Whiskers', species: 'Cat', breed: 'Siamese', age: 3 },
    ],
  },
  {
    id: 'p2',
    ownerName: 'Jane Smith',
    contact: 'jane.smith@example.com',
    pets: [{ id: 'pet3', name: 'Charlie', species: 'Dog', breed: 'Labrador', age: 2 }],
  },
];

const ManagePatientsView: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [selectedPatientIdForPet, setSelectedPatientIdForPet] = useState<string | null>(null);

  const handleAddNewPatient = (ownerName: string, contact: string) => {
    const newPatient: Patient = {
      id: `p${patients.length + 1}-${Date.now()}`, // More unique ID
      ownerName,
      contact,
      pets: [],
    };
    setPatients([...patients, newPatient]);
    setShowAddPatientForm(false);
    alert('New patient added successfully!');
  };

  const handleAddNewPet = (patientId: string, petName: string, petSpecies: string) => {
    setPatients(patients.map(p => {
      if (p.id === patientId) {
        const newPet: Pet = {
          id: `pet${p.pets.length + Date.now()}`, // More unique ID
          name: petName,
          species: petSpecies,
        };
        return { ...p, pets: [...p.pets, newPet] };
      }
      return p;
    }));
    setShowAddPetForm(false);
    setSelectedPatientIdForPet(null);
    alert('New pet added successfully!');
  };
  
  // Ensure a patient is selected by default if the list is not empty when opening add pet form
  const openAddPetForm = () => {
    if (patients.length > 0 && !selectedPatientIdForPet) {
      setSelectedPatientIdForPet(patients[0].id);
    }
    setShowAddPetForm(true);
    setShowAddPatientForm(false);
  };


  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-2xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#4A3F35] mb-3">Manage Patients</h1>
        <p className="text-lg text-gray-600">View, add, or update patient and pet information.</p>
      </header>

      {/* Action Buttons */}
      <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => { setShowAddPatientForm(true); setShowAddPetForm(false); setSelectedPatientIdForPet(null); }}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
        >
          Add New Patient
        </button>
        <button
          onClick={openAddPetForm}
          disabled={patients.length === 0}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Pet to Existing Patient
        </button>
      </div>

      {showAddPatientForm && (
        <AddPatientForm 
          onAddPatient={handleAddNewPatient}
          onCancel={() => setShowAddPatientForm(false)}
        />
      )}

      {showAddPetForm && (
        <AddPetForm
          patients={patients}
          selectedPatientId={selectedPatientIdForPet}
          onAddPet={handleAddNewPet}
          onCancel={() => { setShowAddPetForm(false); setSelectedPatientIdForPet(null); }}
          onSelectPatient={(patientId) => setSelectedPatientIdForPet(patientId)}
        />
      )}

      <PatientList patients={patients} />

    </div>
  );
};

export default ManagePatientsView;
