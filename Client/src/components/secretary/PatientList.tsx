import React from 'react';
import PatientCard from './PatientCard';
import { Patient } from '../../types'; // Import Patient type

interface PatientListProps {
  patients: Patient[];
  onEditPatient: (patient: Patient) => void; // Add onEditPatient prop
}

const PatientList: React.FC<PatientListProps> = ({ patients, onEditPatient }) => {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-[#4A3F35] mb-6">Current Patients</h2>
      {patients.length > 0 ? (
        <div className="space-y-6">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} onEditPatient={onEditPatient} /> // Pass onEditPatient
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No patients found. Click "Add New Patient" to get started.</p>
      )}
    </section>
  );
};

export default PatientList;
