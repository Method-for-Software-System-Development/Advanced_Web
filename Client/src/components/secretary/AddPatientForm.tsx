import React, { useState } from 'react';

interface AddPatientFormProps {
  onAddPatient: (ownerName: string, contact: string) => void;
  onCancel: () => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onAddPatient, onCancel }) => {
  const [ownerName, setOwnerName] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = () => {
    if (!ownerName.trim() || !contact.trim()) {
      alert('Please fill in owner name and contact.');
      return;
    }
    onAddPatient(ownerName, contact);
    setOwnerName('');
    setContact('');
  };

  return (
    <section className="mb-8 p-6 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-[#664147] mb-4">Add New Patient</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">Owner Name:</label>
          <input 
            type="text" 
            id="ownerName" 
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact (Email/Phone):</label>
          <input 
            type="text" 
            id="contact" 
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end gap-3">
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Add Patient</button>
            <button onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
        </div>
      </div>
    </section>
  );
};

export default AddPatientForm;
