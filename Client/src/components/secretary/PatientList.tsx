import React from 'react';
import PatientCard from './PatientCard';

// Assuming Pet and Patient interfaces are defined in a shared types file or passed as props
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

interface PatientListProps {
  patients: Patient[];
}

const PatientList: React.FC<PatientListProps> = ({ patients }) => {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-[#4A3F35] mb-6">Current Patients</h2>
      {patients.length > 0 ? (
        <div className="space-y-6">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No patients found. Click "Add New Patient" to get started.</p>
      )}
    </section>
  );
};

export default PatientList;
