import React, { useState, useEffect } from 'react';
import PatientCard from './PatientCard';
import EditPatientForm from './EditPatientForm';
import { Patient } from '../../types';

interface PatientListProps {
  patients: Patient[];
  onSaveEdit: (updatedPatient: Patient) => void;
  onAddPet: (patientId: string, petName: string, petType:string, petBreed:string, petBirthYear:number, petWeight:number) => void;
  openAddPetForId: string | null;
  setOpenAddPetForId: (id: string | null) => void;
  clearEditFormFlag?: boolean;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onSaveEdit, onAddPet, openAddPetForId, setOpenAddPetForId, clearEditFormFlag }) => {
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  useEffect(() => {
    setEditingPatientId(null);
  }, [clearEditFormFlag]);

  // Helper function to check if patient has all required fields
  const isValidPatient = (patient: Patient) => {
    return patient && 
           patient._id && 
           patient.firstName && 
           patient.lastName && 
           Array.isArray(patient.pets);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatientId(patient._id);
    setOpenAddPetForId(null); // Close add pet form if open
  };

  const handleCancelEdit = () => {
    setEditingPatientId(null);
  };

  const handleSaveEdit = (updatedPatient: Patient) => {
    onSaveEdit(updatedPatient);
    setEditingPatientId(null);
  };

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-6">Current Patients</h2>
      {patients.length > 0 ? (
        <div className="space-y-6">
          {patients.map((patient) => {
            // Skip rendering if patient data is not valid
            if (!isValidPatient(patient)) {
              return null;
            }
            
            // If currently editing this patient, show the edit form
            if (editingPatientId === patient._id) {
              return (
                <EditPatientForm
                  key={patient._id}
                  initialData={patient}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                />
              );
            }
            return (
              <PatientCard
                key={patient._id}
                patient={patient}
                onEditPatient={handleEditPatient}
                onAddPet={onAddPet}
                showAddPetForm={openAddPetForId === patient._id}
                onToggleAddPetForm={() => {
                  setOpenAddPetForId(openAddPetForId === patient._id ? null : patient._id);
                  setEditingPatientId(null); // Close edit form if open
                }}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">No patients found. Click "Add New Patient" to get started.</p>
      )}
    </section>
  );
};

export default PatientList;
