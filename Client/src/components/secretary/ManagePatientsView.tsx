import React, { useState, useMemo } from 'react';
import PatientList from './PatientList';
import AddPatientForm from './AddPatientForm';
import AddPetForm from './AddPetForm';
import DashboardButton from './DashboardButton';
import { Patient, Pet } from '../../types'; // Import Patient and Pet from types

interface ManagePatientsViewProps { // Renamed from EditManagePatientsViewProps for clarity
  onBack: () => void;
}

// Mock data - replace with actual API call in a real application
const mockPatients: Patient[] = [
  {
    id: 'p1',
    ownerName: 'John Doe',
    contact: 'john.doe@example.com',
    phone: '123-456-7890', // Added phone
    pets: [
      { id: 'pet1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: 5 },
      { id: 'pet2', name: 'Whiskers', species: 'Cat', breed: 'Siamese', age: 3 },
    ],
  },
  {
    id: 'p2',
    ownerName: 'Jane Smith',
    contact: 'jane.smith@example.com',
    phone: '098-765-4321', // Added phone
    pets: [{ id: 'pet3', name: 'Charlie', species: 'Dog', breed: 'Labrador', age: 2 }],
  },
  {
    id: 'p3',
    ownerName: 'Alice Wonderland',
    contact: 'alice.wonder@example.com',
    phone: '111-222-3333', // Added phone
    pets: [{ id: 'pet4', name: 'Dinah', species: 'Cat', breed: 'Cheshire', age: 1 }],
  },
];

const ManagePatientsView: React.FC<ManagePatientsViewProps> = ({ onBack }) => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [selectedPatientIdForPet, setSelectedPatientIdForPet] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null); // For editing

  const handleSaveNewPatient = (patientData: Omit<Patient, 'id' | 'pets'>) => {
    const newPatient: Patient = {
      id: `p${patients.length + 1}-${Date.now()}`, // Consider a more robust ID strategy for production
      ownerName: patientData.ownerName,
      contact: patientData.contact,
      phone: patientData.phone,
      pets: [],
    };
    setPatients(currentPatients => [...currentPatients, newPatient]);
    setShowAddPatientForm(false);
    alert('New patient added successfully!');
  };

  const handleSaveUpdatedPatient = (updatedPatientData: Patient) => {
    setPatients(currentPatients =>
      currentPatients.map(p => (p.id === updatedPatientData.id ? updatedPatientData : p))
    );
    setEditingPatient(null);
    alert('Patient details updated successfully!');
  };

  const handleAddNewPet = (patientId: string, petName: string, petSpecies: string) => {
    setPatients(currentPatients =>
      currentPatients.map(p => {
        if (p.id === patientId) {
          const newPet: Pet = {
            id: `pet${p.pets.length + Date.now()}`, // More unique ID
            name: petName,
            species: petSpecies,
          };
          return { ...p, pets: [...p.pets, newPet] };
        }
        return p;
      })
    );
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
    setEditingPatient(null); // Close edit form if open
  };

  const openAddPatientForm = () => {
    setShowAddPatientForm(true);
    setShowAddPetForm(false);
    setEditingPatient(null); // Close edit form if open
  }

  const openEditPatientForm = (patient: Patient) => {
    setEditingPatient(patient);
    setShowAddPatientForm(false); // Close add form if open
    setShowAddPetForm(false); // Close add pet form if open
  };

  // Memoized filtered patients list
  const filteredPatients = useMemo(() => {
    if (!searchTerm) {
      return patients;
    }
    return patients.filter(patient =>
      patient.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.pets.some(pet => pet.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [patients, searchTerm]);

  return (
    <>
    <div className="mb-8 text-center">
        <DashboardButton onClick={onBack} label="&larr; Back to Dashboard" />
        </div>
        
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-2xl">
        
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#4A3F35] mb-3">Manage Patients</h1>
        <p className="text-lg text-gray-600">View, add, or update patient and pet information.</p>
      </header>

      {/* Search Input */}
      <div className="mb-8 px-2">
        <label htmlFor="searchPatients" className="block text-sm font-medium text-gray-700 mb-1">
          Search Patients (by Owner, Contact, or Pet Name)
        </label>
        <input
          type="text"
          id="searchPatients"
          placeholder="Enter search term..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={openAddPatientForm} // Use new handler
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

      {showAddPatientForm && !editingPatient && (
        <AddPatientForm 
          onSave={handleSaveNewPatient} // Changed from onAddPatient to onSave
          onCancel={() => setShowAddPatientForm(false)}
        />
      )}

      {editingPatient && (
        <AddPatientForm // Re-using AddPatientForm for editing, could be a separate EditPatientForm
          onSave={handleSaveUpdatedPatient as (patientData: Patient | Omit<Patient, 'id' | 'pets'>) => void} // Changed from onAddPatient to onSave
          onCancel={() => setEditingPatient(null)}
          initialData={editingPatient} // Pass initial data for editing
        />
      )}

      {showAddPetForm && (
        <AddPetForm
          patients={patients} // Pass all patients to AddPetForm for the dropdown
          selectedPatientId={selectedPatientIdForPet}
          onAddPet={handleAddNewPet}
          onCancel={() => { setShowAddPetForm(false); setSelectedPatientIdForPet(null); }}
          onSelectPatient={(patientId) => setSelectedPatientIdForPet(patientId)}
        />
      )}

      <PatientList patients={filteredPatients} onEditPatient={openEditPatientForm} />

    </div>
    </>
  );
};

export default ManagePatientsView;
