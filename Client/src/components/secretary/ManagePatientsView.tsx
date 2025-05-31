import React, { useState, useMemo,useEffect } from 'react';
import PatientList from './PatientList';
import AddPatientForm from './AddPatientForm';
import AddPetForm from './AddPetForm';
import DashboardButton from './DashboardButton';
import { Patient, Pet } from '../../types'; // Import Patient and Pet from types
import { patientService } from '../../services/patientService';

interface ManagePatientsViewProps { // Renamed from EditManagePatientsViewProps for clarity
  onBack: () => void;
}

const ManagePatientsView: React.FC<ManagePatientsViewProps> = ({ onBack }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [selectedPatientIdForPet, setSelectedPatientIdForPet] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null); // For editing
  const [openAddPetForId, setOpenAddPetForId] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
      console.error('Error loading veterinarians:', err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNewPatient = (patientData: Omit<Patient, 'id' | 'pets'>) => {
    const newPatient: Patient = {
      id: `p${patients.length + 1}-${Date.now()}`, // Consider a more robust ID strategy for production
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      email: patientData.email,
      phone: patientData.phone,
      city: patientData.city,
      country: patientData.country,
      pets: [], // Initialize with an empty array
      postalCode: patientData.postalCode, // Optional field
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

  const handleAddNewPet = (patientId: string, petName: string, petType:string, petBreed: string, petBirthYear:number, petWeight:number) => {
    setPatients(currentPatients =>
      currentPatients.map(p => {
        if (p.id === patientId) {
          const newPet: Pet = {
            _id: `pet${p.pets.length + Date.now()}`, // More unique ID
            name: petName,
            type: petType,
            breed: petBreed,
            birthYear: petBirthYear,
            weight: petWeight,
            prescriptions: [], // Initialize with empty arrays
            treatments: []     // Initialize with empty arrays
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
  
  const openAddPatientForm = () => {
    setShowAddPatientForm(true);
    setOpenAddPetForId(null); // Close any open Add New Pet form
    setShowAddPetForm(false); // (if you still use this state elsewhere)
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
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.postalCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.pets.some(pet => pet.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [patients, searchTerm]);

  if (loading) return <div>Loading patients...</div>;
  if (error) return <div>Error: {error}</div>;

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
          onClick={openAddPatientForm}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
        >
          Add New Patient
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
          patients={patients}
          selectedPatientId={selectedPatientIdForPet}
          onAddPet={handleAddNewPet}
          onCancel={() => { setShowAddPetForm(false); setSelectedPatientIdForPet(null); }}
          onSelectPatient={(patientId) => setSelectedPatientIdForPet(patientId)}
        />
      )}

      <PatientList
        patients={filteredPatients}
        onEditPatient={openEditPatientForm}
        onAddPet={(patientId, petName, petType, petBreed, petBirthYear, petWeight) => {
          setPatients(currentPatients =>
            currentPatients.map(p => {
              if (p.id === patientId) {
                const newPet: Pet = {
                  _id: `pet${p.pets.length + Date.now()}`,
                  name: petName,
                  type: petType,
                  breed: petBreed,
                  birthYear: petBirthYear,
                  weight: petWeight,
                  prescriptions: [], // Initialize with empty arrays
                  treatments: []     // Initialize with empty arrays
                };
                return { ...p, pets: [...p.pets, newPet] };
              }
              return p;
            })
          );
          setOpenAddPetForId(null);
          alert('New pet added successfully!');
        }}
        openAddPetForId={openAddPetForId}
        setOpenAddPetForId={(id) => {
          setOpenAddPetForId(id);
          setShowAddPatientForm(false); // Always close add-client form when opening or closing add-pet
        }}
      />

    </div>
    </>
  );
};

export default ManagePatientsView;
