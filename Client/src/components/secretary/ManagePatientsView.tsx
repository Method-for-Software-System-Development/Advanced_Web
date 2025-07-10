import React, { useState, useMemo, useEffect } from 'react';
import PatientList from './PatientList';
import AddPatientForm from './AddPatientForm';
import { Patient, Pet } from '../../types'; // Import Patient and Pet from types
import { patientService } from '../../services/patientService';
import { petService } from '../../services/petService';
import { Plus } from 'lucide-react';

/** Props for patient management view component */
interface ManagePatientsViewProps { // Renamed from EditManagePatientsViewProps for clarity
  onBack: () => void;
}

/** Patient management view with operations, search, and auto-refresh */
const ManagePatientsView: React.FC<ManagePatientsViewProps> = ({ onBack }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddPetForId, setOpenAddPetForId] = useState<string | null>(null); const [openEditPetForId, setOpenEditPetForId] = useState<string | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  /** Initial load effect - runs only once on mount */
  useEffect(() => {
    loadPatients(true);
  }, []); // Empty dependency array - runs only once
  
  /** Interval effect - auto-refreshes data when no forms are open */
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Check if any forms are currently open before refreshing
      const isAnyFormOpen = showAddPatientForm ||
        openAddPetForId !== null ||
        openEditPetForId !== null ||
        editingPatientId !== null;

      // Only refresh if no forms are open
      if (!isAnyFormOpen) {
        loadPatients(false);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [showAddPatientForm, openAddPetForId, openEditPetForId, editingPatientId]); // Dependencies to track form states
  
  /** Loads patients data with optional loading state management */
  const loadPatients = async (isInitialCall: boolean = false) => { // Added type for isInitialCall
    if (isInitialCall) {
      setLoading(true); // Only set global loading true for initial load
      setError(null); // Clear previous errors specifically for an initial load attempt
    }

    try {
      // The list will simply update when new data arrives.
      const data = await patientService.getAllPatients();
      // Filter out secretaries - only show users with role "user" (patients)
      const patientsOnly = data.filter((user: any) => user.role === 'user' || !user.role);
      setPatients(patientsOnly);
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

  /** Handles creation of new patient with API call and state update */
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

  /** Handles patient information updates with API call and state sync */
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

  /** Handles adding new pet to a patient with API call and state update */
  const handleAddNewPet = async (patientId: string, petName: string, petType: string, petBreed: string, petBirthYear: number, petWeight: number, sex: string, isActive: boolean) => {
    try {
      const newPetData = {
        name: petName,
        type: petType,
        breed: petBreed,
        birthYear: petBirthYear,
        weight: petWeight,
        sex: sex,
        isActive: isActive,
        imageUrl: '', // Add required imageUrl property
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

  /** Handles pet information updates with API call and state sync */
  const handleEditPet = async (petId: string, petData: Partial<Omit<Pet, '_id' | 'prescriptions' | 'treatments'>>) => {
    try {
      // Call the service to update the pet
      const updatedPet = await petService.updatePet(petId, petData);

      setPatients(currentPatients =>
        currentPatients.map(p => ({
          ...p,
          pets: p.pets.map(pet =>
            pet._id === petId ? updatedPet : pet
          )
        }))
      );
      alert('Pet updated successfully!');
    } catch (error) {
      console.error("Failed to update pet:", error);
      alert("Failed to update pet. Please try again.");
    }
  };
  
  /** Memoized filtered and sorted patients list based on search term */
  const filteredPatients = useMemo(() => {
    let result = patients;

    // Filter patients based on search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase().trim();

      result = patients.filter(patient => {
        // Create a full name string for better name matching
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();

        // Check if the search term matches any of the searchable fields
        return fullName.includes(searchTermLower) ||
          patient.firstName.toLowerCase().includes(searchTermLower) ||
          patient.lastName.toLowerCase().includes(searchTermLower) ||
          patient.email.toLowerCase().includes(searchTermLower) ||
          patient.phone.toLowerCase().includes(searchTermLower) ||
          patient.street.toLowerCase().includes(searchTermLower) ||
          patient.city.toLowerCase().includes(searchTermLower) ||
          patient.postalCode?.toLowerCase().includes(searchTermLower) ||
          patient.pets.some(pet => pet.name.toLowerCase().includes(searchTermLower));
      });
    }

    // Sort patients alphabetically by full name (first name + last name)
    return result.sort((a, b) => {
      const fullNameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const fullNameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return fullNameA.localeCompare(fullNameB);
    });
  }, [patients, searchTerm]);
  if (loading) return <div className="text-grayText dark:text-white">Loading patients...</div>;
  if (error) return <div className="text-red-600 dark:text-white">Error: {error}</div>;
  return (
    <>
      <div className="max-w-7xl mx-auto mt-5 mb-10 p-4 md:p-8 bg-white dark:bg-darkModeLight rounded-xl shadow-2xl">

        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-wine font-[Nunito] dark:text-white mb-1">&#128062; Manage Patients</h1>
          <p className="text-lg text-grayText dark:text-lightGrayText">Update patient records and contact information</p>
        </header>

        {/* Search Input */}
        <div className="mb-8 px-2">          <label htmlFor="searchPatients" className="block text-sm font-medium text-grayText dark:text-white mb-1">
            Search Patients (by Owner, Contact, or Pet Name)
          </label>
          <input
            type="text"
            id="searchPatients"
            placeholder="Enter search term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-grayText"
          />
        </div>      {/* Action Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => {
              setShowAddPatientForm(true);
              setOpenAddPetForId(null);
              setOpenEditPetForId(null); // Close edit pet form if open
              setEditingPatientId(null); // Close edit patient form if open
            }}            className="flex items-center justify-center gap-2 px-8 h-11 bg-pinkDark text-white font-bold rounded-full hover:bg-pinkDarkHover transition-colors duration-200 cursor-pointer"
          >
            <Plus size={20} />
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
          onEditPet={handleEditPet}
          openAddPetForId={openAddPetForId}
          setOpenAddPetForId={(id) => {
            setOpenAddPetForId(id);
            setShowAddPatientForm(false);
          }}
          openEditPetForId={openEditPetForId}
          setOpenEditPetForId={(id) => {
            setOpenEditPetForId(id);
            setShowAddPatientForm(false);
          }}
          editingPatientId={editingPatientId}
          setEditingPatientId={setEditingPatientId}
        />

      </div>
    </>
  );
};

export default ManagePatientsView;
