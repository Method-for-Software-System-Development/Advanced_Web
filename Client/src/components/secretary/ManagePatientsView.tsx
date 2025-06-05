import React, { useState, useMemo,useEffect } from 'react';
import PatientList from './PatientList';
import AddPatientForm from './AddPatientForm';
import DashboardButton from './DashboardButton';
import { Patient } from '../../types'; // Import Patient and Pet from types
import { patientService } from '../../services/patientService';
import { petService } from '../../services/petService';

interface ManagePatientsViewProps { // Renamed from EditManagePatientsViewProps for clarity
  onBack: () => void;
}

const ManagePatientsView: React.FC<ManagePatientsViewProps> = ({ onBack }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddPetForId, setOpenAddPetForId] = useState<string | null>(null);
  const [clearEditFormFlag, setClearEditFormFlag] = useState(false);

  useEffect(() => {
    // Call loadPatients with isInitialCall = true for the first load
    loadPatients(true);
    const intervalId = setInterval(() => loadPatients(false), 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  const loadPatients = async (isInitialCall: boolean = false) => { // Added type for isInitialCall
    if (isInitialCall) {
      setLoading(true); // Only set global loading true for initial load
      setError(null); // Clear previous errors specifically for an initial load attempt
    }

    try {
      // The list will simply update when new data arrives.
      const data = await patientService.getAllPatients();
      setPatients(data);
      setError(null); // Clear any previous error on successful fetch (initial or poll)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
      console.error('Error loading patients:', err); // Corrected console message
      if (isInitialCall) {
        // Only clear patients if the initial load fails.
        // For polling errors, retain stale data and show error.
        setPatients([]);
      }
    } finally {
      if (isInitialCall) {
        setLoading(false); // Turn off global loading state after initial attempt
      }
    }
  };

  const handleSaveNewPatient = async (patientData: Omit<Patient, '_id' | 'pets'>) => {
    try {
      // Call the backend API to create the patient
      const createdPatient = await patientService.createPatient({ ...patientData, pets: [] });
      setPatients(currentPatients => [...currentPatients, createdPatient]);
      setShowAddPatientForm(false);
      alert('New patient added successfully!');
      return createdPatient; // Return the created patient so the form knows it succeeded

    } catch (error: any) {
      alert(error.message || 'Failed to add new patient.');
      console.error('Error adding new patient:', error);
    }
  };

  const handleSaveUpdatedPatient = async (updatedPatientData: Patient) => {
    try {
      // Call the backend API to update the patient
      await patientService.updatePatient(updatedPatientData._id, { 
        firstName: updatedPatientData.firstName,
        lastName: updatedPatientData.lastName,
        email: updatedPatientData.email,
        phone: updatedPatientData.phone,
        street: updatedPatientData.street,
        city: updatedPatientData.city,
        postalCode: updatedPatientData.postalCode
      });
      setPatients(currentPatients =>
        currentPatients.map(p =>
          p._id === updatedPatientData._id
            ? { ...p, email: updatedPatientData.email, phone: updatedPatientData.phone }
            : p
        )
      );
      alert('Patient details updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update patient.');
      console.error('Error updating patient:', error);
    }
  };

  const handleAddNewPet = async (patientId: string, petName: string, petType:string, petBreed: string, petBirthYear:number, petWeight:number) => {
    try {
      const newPetData = {
        name: petName,
        type: petType,
        breed: petBreed,
        birthYear: petBirthYear,
        weight: petWeight,
        prescriptions: [], // Ensure these are initialized if not provided by form
        treatments: []
      };
  
      // Call the service to add the new pet
      const addedPet = await petService.addPetForPatient(patientId, newPetData);
  
      setPatients(currentPatients =>
        currentPatients.map(p => {
          if (p._id === patientId) { // Using _id here because your patient objects use it
            return { ...p, pets: [...p.pets, addedPet] };
          }
          return p;
        })
      );
      setOpenAddPetForId(null);
      alert('New pet added successfully!');
    } catch (error) {
      console.error("Failed to add new pet:", error);
      alert("Failed to add new pet. Please try again.");
    }
  };
  
  // Memoized filtered patients list
  const filteredPatients = useMemo(() => {
    if (!searchTerm) {
      return patients;
    }
    return patients.filter(patient =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.postalCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.pets.some(pet => pet.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [patients, searchTerm]);
  if (loading) return <div className="dark:text-gray-300">Loading patients...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;

  return (
    <>
    <div className="mb-8 text-center">
        <DashboardButton onClick={onBack} label="&larr; Back to Dashboard" />
        </div>
          <div className="max-w-6xl mx-auto p-4 md:p-8 bg-white dark:bg-[#664147] rounded-xl shadow-2xl">
        
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#4A3F35] dark:text-[#FDF6F0] mb-3">Manage Patients</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">View, add, or update patient and pet information.</p>
      </header>

      {/* Search Input */}
      <div className="mb-8 px-2">
        <label htmlFor="searchPatients" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search Patients (by Owner, Contact, or Pet Name)
        </label>
        <input
          type="text"
          id="searchPatients"
          placeholder="Enter search term..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        />
      </div>      {/* Action Buttons */}
      <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => {
            setShowAddPatientForm(true);
            setOpenAddPetForId(null);
            setClearEditFormFlag(f => !f); // Toggle to signal PatientList to clear edit
          }}
          className="px-6 py-3 bg-green-500 dark:bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200"
        >
          Add New Patient
        </button>
      </div>

      {showAddPatientForm && (
        <AddPatientForm 
          onSave={handleSaveNewPatient}
          onCancel={() => setShowAddPatientForm(false)}
        />
      )}

      <PatientList
        patients={filteredPatients}
        onSaveEdit={handleSaveUpdatedPatient}
        onAddPet={handleAddNewPet}
        openAddPetForId={openAddPetForId}
        setOpenAddPetForId={(id) => {
          setOpenAddPetForId(id);
          setShowAddPatientForm(false);
        }}
        clearEditFormFlag={clearEditFormFlag}
      />

    </div>
    </>
  );
};

export default ManagePatientsView;
