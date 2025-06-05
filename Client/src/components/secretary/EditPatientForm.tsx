import React, { useState } from 'react';
import DashboardButton from './DashboardButton';
import { Patient } from '../../types';

export interface EditPatientFormProps {
  initialData: Patient;
  onSave: (updatedPatient: Patient) => void;
  onCancel: () => void;
}

const EditPatientForm: React.FC<EditPatientFormProps> = ({ initialData, onSave, onCancel }) => {
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone);
  const [street, setStreet] = useState(initialData.street);
  const [city, setCity] = useState(initialData.city);
  const [postalCode, setPostalCode] = useState(initialData.postalCode || '');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields = [];
    if (!firstName.trim()) missingFields.push('First Name');
    if (!lastName.trim()) missingFields.push('Last Name');
    if (!email.trim()) missingFields.push('Email');
    if (!phone.trim()) missingFields.push('Phone');
    if (!street.trim()) missingFields.push('Street');
    if (!city.trim()) missingFields.push('City');
    if (missingFields.length > 0) {
      setErrorMessage('Please fill in: ' + missingFields.join(', '));
      return;
    }
    onSave({
      ...initialData,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      postalCode: postalCode.trim() || '',
    });
  };

  return (
    <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-[#664147] dark:text-[#FDF6F0] mb-4">Edit Patient</h2>
      <div className="space-y-4">
        {errorMessage && (
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded border border-red-300 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm font-medium w-full max-w-lg mx-auto">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*First Name:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={e => { const v = e.target.value; if (/^[a-zA-Z\s-]*$/.test(v)) setFirstName(v); }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*Last Name:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={e => { const v = e.target.value; if (/^[a-zA-Z\s-]*$/.test(v)) setLastName(v); }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*Phone:</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={e => { const v = e.target.value; if (/^\d*$/.test(v)) setPhone(v); }}
            inputMode="numeric"
            pattern="[0-9]*"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*Street:</label>
          <input
            type="text"
            id="street"
            value={street}
            onChange={e => setStreet(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*City:</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code:</label>
          <input
            type="text"
            id="postalCode"
            value={postalCode}
            onChange={e => { const v = e.target.value; if (/^\d*$/.test(v)) setPostalCode(v); }}
            inputMode="numeric"
            pattern="[0-9]*"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700">Save Changes</button>
          <DashboardButton onClick={onCancel} label="Cancel" />
        </div>
      </div>
    </section>
  );
};

export default EditPatientForm;
