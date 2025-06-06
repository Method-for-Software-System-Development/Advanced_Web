import React, { useState, useEffect } from 'react';

interface AddPetFormProps {
  selectedPatientName: string;
  selectedPatientId: string;
  onAddPet: (patientId: string, petName: string, petType: string, petBreed: string, petBirthYear: number, petWeight: number, sex: string, isActive: boolean) => void;
  onCancel: () => void;
}

const AddPetForm: React.FC<AddPetFormProps> = ({ 
  selectedPatientName, 
  selectedPatientId,
  onAddPet, 
  onCancel,
}) => {
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petBirthYear, setPetBirthYear] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petSex, setPetSex] = useState('');
  const [isActive, setIsActive] = useState(true);  // Effect to reset pet form fields if the selected patient changes or form is re-shown
  useEffect(() => {
    setPetName('');
    setPetType('');
    setPetBreed('');
    setPetBirthYear('');
    setPetWeight('');
    setPetSex('');
    setIsActive(true);
  }, [selectedPatientId]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim() || !petType.trim() || !petBreed.trim() || !petBirthYear.trim() || !petWeight.trim() || !petSex.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    onAddPet(selectedPatientId, petName, petType, petBreed, Number(petBirthYear), Number(petWeight), petSex, isActive);
    // Parent will hide form and reset selectedPatientId if needed
  };
  return (
    <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-[#664147] dark:text-[#FDF6F0] mb-4">Add Pet to Patient</h2>
      <div className="space-y-4">
        {selectedPatientId ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client:</label>
            <div className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200">
              {selectedPatientName}
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor='selectedPatient' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Selected Patient:</label>
            <label className="mt-1 block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200">
              {selectedPatientName}
            </label>
          </div>
        )}
        <div>
          <label htmlFor="petName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pet Name:</label>
          <input 
            type="text" 
            id="petName" 
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="petType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pet Type:</label>
          <input 
            type="text" 
            id="petType" 
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />        
        </div>
        <div>
          <label htmlFor="petBreed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pet Breed:</label>
          <input 
            type="text" 
            id="petBreed" 
            value={petBreed}
            onChange={(e) => setPetBreed(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="petBirthYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birth Year:</label>
          <input 
            type="number" 
            id="petBirthYear" 
            value={petBirthYear}
            onChange={(e) => setPetBirthYear(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="petWeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg):</label>
          <input 
            type="number" 
            id="petWeight" 
            value={petWeight}
            onChange={(e) => setPetWeight(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="petSex" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sex:</label>
          <select
            id="petSex"
            value={petSex}
            onChange={(e) => setPetSex(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          >
            <option value="">Select sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label htmlFor="petStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pet Status:</label>
          <select
            id="petStatus"
            value={isActive ? 'active' : 'inactive'}
            onChange={(e) => setIsActive(e.target.value === 'active')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex justify-end gap-3">
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50">Add Pet</button>
            <button onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700">Cancel</button>
        </div>
      </div>
    </section>
  );
};

export default AddPetForm;
