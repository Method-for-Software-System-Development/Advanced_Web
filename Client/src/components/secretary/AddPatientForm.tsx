import React, { useState } from 'react';
import DashboardButton from './DashboardButton';
import { Patient } from '../../types'; // Import Patient type
import { patientService } from '../../services/patientService'; 

interface AddPatientFormProps {
  onSave: (patientData: Omit<Patient, '_id' | 'pets'> | Patient) => void; // Adjusted to handle both add and update
  onCancel: () => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onSave, onCancel }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState(''); 
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); 
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState(''); // Optional field for postal code
  const [password, setPassword] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    // Collect missing required fields
    const missingFields = [];
    if (!firstName.trim()) missingFields.push('First Name');
    if (!lastName.trim()) missingFields.push('Last Name');
    if (!email.trim()) missingFields.push('Email');
    if (!phone.trim()) missingFields.push('Phone');
    if (!street.trim()) missingFields.push('Street');
    if (!city.trim()) missingFields.push('City');
    if (!password.trim()) missingFields.push('Password');

    if (missingFields.length > 0) {
      setErrorMessage('Please fill in: ' + missingFields.join(', '));
      return;
    }

    // Check if email already exists in the DB
    try {
      const allPatients = await patientService.getAllPatients();
      const emailExists = allPatients.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
      if (emailExists) {
        setErrorMessage('A patient with this email already exists.');
        // Clear the form fields
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setStreet('');
        setCity('');
        setPostalCode('');
        setPassword('');
        return;
      } else {
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage('Failed to check for existing patients. Please try again.');
      console.error('Error checking for existing patients:', error);
      return;
    }

    const patientData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      street: street.trim(), 
      city: city.trim(),
      postalCode: postalCode.trim() || '', // Always set to string, never undefined
      password: password.trim(),
    };

    onSave(patientData); // add new patient
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '—', color: 'text-gray-400' };
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const length = pwd.length;
    const charGroups = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (length < 8) {
      return { label: 'Weak (less than 8 characters)', color: 'text-red-500' };
    }
    if (length >= 8 && length < 10 && charGroups >= 2) {
      return { label: 'Medium', color: 'text-yellow-500' };
    }
    if (length >= 10 && charGroups >= 3) {
      return { label: 'Strong', color: 'text-green-600' };
    }
    // fallback for 8-10 chars but not enough groups
    return { label: 'Weak (add more character types)', color: 'text-red-500' };
  };

  return (
    <section className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-[#664147] dark:text-[#FDF6F0] mb-4">
        Add New Patient
      </h2>
      <div className="space-y-4">
        {errorMessage && (
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded border border-red-300 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm font-medium w-full max-w-lg mx-auto">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
              </svg>
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
            onChange={(e) => {
              // Only allow letters, spaces, and hyphens
              const value = e.target.value;
              if (/^[a-zA-Z\s-]*$/.test(value)) {
                setFirstName(value);
              }
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*Last Name:</label>
          <input 
            type="text" 
            id="lastName" 
            value={lastName}
            onChange={(e) => {
              // Only allow letters, spaces, and hyphens
              const value = e.target.value;
              if (/^[a-zA-Z\s-]*$/.test(value)) {
                setLastName(value);
              }
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*Phone:</label>
          <input 
            type="text" 
            id="phone" 
            value={phone}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setPhone(value);
              }
            }}
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
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*Street:</label>
          <input 
            type="text" 
            id="street" 
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*City:</label>
          <input 
            type="text" 
            id="city" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code:</label>
          <input 
            type="text" 
            id="postalCode" 
            value={postalCode}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setPostalCode(value);
              }
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">*Password:</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
          <div className={"mt-1 text-xs " + getPasswordStrength(password).color + " dark:text-gray-400"}>
            Strength: {getPasswordStrength(password).label}
          </div>
        </div>
        <div className="flex justify-end gap-3">
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700">
              Add Patient
            </button>
            <DashboardButton onClick={onCancel} label="Cancel" />
        </div>
      </div>
    </section>
  );
};

export default AddPatientForm;
