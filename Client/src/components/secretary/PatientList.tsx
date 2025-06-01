import React from 'react';
import PatientCard from './PatientCard';
import { Patient } from '../../types';

interface PatientListProps {
  patients: Patient[];
  onEditPatient: (patient: Patient) => void;
  onAddPet: (patientId: string, petName: string, petType:string, petBreed:string, petBirthYear:number, petWeight:number) => void;
  openAddPetForId: string | null;
  setOpenAddPetForId: (id: string | null) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onEditPatient, onAddPet, openAddPetForId, setOpenAddPetForId }) => {
  return (    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-6">Current Patients</h2>
      {patients.length > 0 ? (
        <div className="space-y-6">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onEditPatient={onEditPatient}
              onAddPet={onAddPet}
              showAddPetForm={openAddPetForId === patient.id}
              onToggleAddPetForm={() => setOpenAddPetForId(openAddPetForId === patient.id ? null : patient.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">No patients found. Click "Add New Patient" to get started.</p>
      )}
    </section>
  );
};

export default PatientList;
