import React, { useState, useEffect } from 'react';
import DashboardButton from './DashboardButton';
import { Patient } from '../../types'; // Import Patient type

interface AddPatientFormProps {
  onSave: (patientData: Omit<Patient, 'id' | 'pets'> | Patient) => void; // Adjusted to handle both add and update
  onCancel: () => void;
  initialData?: Patient | null; // Optional initial data for editing
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onSave, onCancel, initialData }) => {
  const [ownerName, setOwnerName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState(''); // Added phone state

  useEffect(() => {
    if (initialData) {
      setOwnerName(initialData.ownerName);
      setContact(initialData.contact);
      setPhone(initialData.phone || '');
    } else {
      // Reset form if not editing
      setOwnerName('');
      setContact('');
      setPhone('');
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!ownerName.trim() || !contact.trim()) { // Basic validation
      alert('Please fill in owner name and contact.');
      return;
    }

    const patientData = {
      ownerName,
      contact,
      phone,
    };

    if (initialData) {
      onSave({ ...initialData, ...patientData }); // Pass full patient object for update
    } else {
      onSave(patientData); // Pass partial data for new patient
    }
  };

  return (
    <section className="mb-8 p-6 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-[#664147] mb-4">
        {initialData ? 'Edit Patient' : 'Add New Patient'}
      </h2>
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
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact (Email):</label> {/* Changed label slightly */}
          <input 
            type="text" 
            id="contact" 
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div> {/* Added Phone Input */}
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone:</label>
          <input 
            type="tel" 
            id="phone" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end gap-3">
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              {initialData ? 'Save Changes' : 'Add Patient'}
            </button>
            <DashboardButton onClick={onCancel} label="Cancel" />
        </div>
      </div>
    </section>
  );
};

export default AddPatientForm;
