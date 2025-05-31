import React, { useState, useEffect } from 'react';

// Assuming Patient interface is defined elsewhere or passed
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  postalCode?: string; // Optional field for postal code
}

interface AddPetFormProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onAddPet: (patientId: string, petName: string, petType: string, petBreed: string, petBirthYear: number, petWeight: number) => void;
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
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petBirthYear, setPetBirthYear] = useState('');
  const [petWeight, setPetWeight] = useState('');

  // Effect to reset pet form fields if the selected patient changes or form is re-shown
  useEffect(() => {
    setPetName('');
    setPetType('');
    setPetBreed('');
    setPetBirthYear('');
    setPetWeight('');
  }, [selectedPatientId]);

  const handleSubmit = () => {
    if (!selectedPatientId || !petName.trim() || !petType.trim() || !petBreed.trim() || !petBirthYear.trim() || !petWeight.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    onAddPet(selectedPatientId, petName, petType, petBreed, Number(petBirthYear), Number(petWeight));
    // Parent will hide form and reset selectedPatientId if needed
  };

  return (
    <section className="mb-8 p-6 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-[#664147] mb-4">Add Pet to Patient</h2>
      <div className="space-y-4">
        {selectedPatientId ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">Client:</label>
            <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
              {patients.find(p => p.id === selectedPatientId)?.firstName} {patients.find(p => p.id === selectedPatientId)?.lastName}
            </div>
          </div>
        ) : (
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
              {patients.map(p =>
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              )}
            </select>
          </div>
        )}
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
          <label htmlFor="petType" className="block text-sm font-medium text-gray-700">Pet Type:</label>
          <input 
            type="text" 
            id="petType" 
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={!selectedPatientId}
          />
        </div>
        <div>
          <label htmlFor="petBreed" className="block text-sm font-medium text-gray-700">Pet Breed:</label>
          <input 
            type="text" 
            id="petBreed" 
            value={petBreed}
            onChange={(e) => setPetBreed(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={!selectedPatientId}
          />
        </div>
        <div>
          <label htmlFor="petBirthYear" className="block text-sm font-medium text-gray-700">Birth Year:</label>
          <input 
            type="number" 
            id="petBirthYear" 
            value={petBirthYear}
            onChange={(e) => setPetBirthYear(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={!selectedPatientId}
          />
        </div>
        <div>
          <label htmlFor="petWeight" className="block text-sm font-medium text-gray-700">Weight (kg):</label>
          <input 
            type="number" 
            id="petWeight" 
            value={petWeight}
            onChange={(e) => setPetWeight(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={!selectedPatientId}
          />
        </div>
        <div className="flex justify-end gap-3">
            <button onClick={handleSubmit} disabled={!selectedPatientId} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">Add Pet</button>
            <button onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
        </div>
      </div>
    </section>
  );
};

export default AddPetForm;
