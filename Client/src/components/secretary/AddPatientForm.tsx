import React, { useState, useEffect } from 'react';
import DashboardButton from './DashboardButton';
import { Patient } from '../../types'; // Import Patient type

interface AddPatientFormProps {
  onSave: (patientData: Omit<Patient, '_id' | 'pets'> | Patient) => void; // Adjusted to handle both add and update
  onCancel: () => void;
  initialData?: Patient | null; // Optional initial data for editing
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onSave, onCancel, initialData }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState(''); 
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Added phone state
  const [city, setCity] = useState('');
  const [country, setCountry] = useState(''); 
  const [postalCode, setPostalCode] = useState(''); // Optional field for postal code

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setEmail(initialData.email);
      setPhone(initialData.phone || '');
      setCity(initialData.city);
      setCountry(initialData.country);
      setPostalCode(initialData.postalCode || ''); // Handle optional postal code
    } else {
      // Reset form if not editing
      setFirstName(''); 
      setLastName('');
      setEmail('');
      setPhone('');
      setCity('');
      setCountry('');
      setPostalCode('');
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!firstName.trim()) {
      alert('Please fill in owner first name.');
      return;
    }
    if (!lastName.trim()) {
      alert('Please fill in owner last name.');
      return;
    }
    if (!email.trim()) {
      alert('Please fill in owner email.');
      return;
    }
    if (!phone.trim()) {
      alert('Please fill in owner phone.');
      return;
    }
    if (!city.trim()) {
      alert('Please fill in owner city.');
      return;
    }
    if (!country.trim()) {
      alert('Please fill in owner country.');
      return;
    }

    const patientData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(), // Include phone in patient data
      city: city.trim(),
      country: country.trim(),
      postalCode: postalCode.trim() || undefined, // Optional field, set to undefined if empty
    };

    if (initialData) {
      onSave({ ...initialData, ...patientData }); // Pass full patient object for update
    } else {
      onSave(patientData); // Pass partial data for new patient
    }
  };
  return (
    <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-[#664147] dark:text-[#FDF6F0] mb-4">
        {initialData ? 'Edit Patient' : 'Add New Patient'}
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name:</label>
          <input 
            type="text" 
            id="firstName" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name:</label>
          <input 
            type="text" 
            id="lastName" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        <div> {/* Added Phone Input */}
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone:</label>
          <input 
            type="tel" 
            id="phone" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City:</label>
          <input 
            type="text" 
            id="city" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country:</label>
          <input 
            type="text" 
            id="country" 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code:</label> {/* Optional field */}
          <input 
            type="text" 
            id="postalCode" 
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div className="flex justify-end gap-3">
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700">
              {initialData ? 'Save Changes' : 'Add Patient'}
            </button>
            <DashboardButton onClick={onCancel} label="Cancel" />
        </div>
      </div>
    </section>
  );
};

export default AddPatientForm;
