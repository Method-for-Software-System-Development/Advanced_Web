import React, { useState, useEffect } from 'react';

// Assuming Patient interface is defined elsewhere or passed
interface Patient {
  id: string;
  ownerName: string;
  // other fields if necessary for display in select
}

interface AddPetFormProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onAddPet: (patientId: string, petName: string, petSpecies: string) => void;
  onCancel: () => void;
  onSelectPatient: (patientId: string) => void;
}

const AddPetForm: React.FC<AddPetFormProps> = ({ 
  patients, 
  selectedPatientId,
  onAddPet, 
  onCancel,
  onSelectPatient
}) => {
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('');

  // Effect to reset pet form fields if the selected patient changes or form is re-shown
  useEffect(() => {
    setPetName('');
    setPetSpecies('');
  }, [selectedPatientId]);

  const handleSubmit = () => {
    if (!selectedPatientId || !petName.trim() || !petSpecies.trim()) {
      alert('Please select a patient and fill in pet name and species.');
      return;
    }
    onAddPet(selectedPatientId, petName, petSpecies);
    // Parent will hide form and reset selectedPatientId if needed
  };

  return (
    <section className="mb-8 p-6 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-[#664147] mb-4">Add Pet to Patient</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="selectPatient" className="block text-sm font-medium text-gray-700">Select Patient:</label>
          <select 
            id="selectPatient" 
            value={selectedPatientId || ''} // Ensure value is not null for select
            onChange={(e) => onSelectPatient(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={patients.length === 0}
          >
            <option value="" disabled={selectedPatientId !== null}>-- Select a Patient --</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.ownerName}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="petName" className="block text-sm font-medium text-gray-700">Pet Name:</label>
          <input 
            type="text" 
            id="petName" 
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={!selectedPatientId}
          />
        </div>
        <div>
          <label htmlFor="petSpecies" className="block text-sm font-medium text-gray-700">Pet Species:</label>
          <input 
            type="text" 
            id="petSpecies" 
            value={petSpecies}
            onChange={(e) => setPetSpecies(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={!selectedPatientId}
          />
        </div>
        {/* Add more fields for pet like breed, age etc. as needed */}
        <div className="flex justify-end gap-3">
            <button onClick={handleSubmit} disabled={!selectedPatientId} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">Add Pet</button>
            <button onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
        </div>
      </div>
    </section>
  );
};

export default AddPetForm;
