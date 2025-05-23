import React from 'react';
import DashboardButton from './DashboardButton'; 

interface EditVeterinariansViewProps {
  onBack: () => void;
}

const EditVeterinariansView: React.FC<EditVeterinariansViewProps> = ({ onBack }) => {
  // Mock data for veterinarians
  const veterinarians = [
    { id: '1', name: 'Dr. Smith', specialization: 'Cardiology', contact: 'smith@example.com', availableSlots: ['Mon 9-12', 'Wed 10-1'] },
    { id: '2', name: 'Dr. Jones', specialization: 'Neurology', contact: 'jones@example.com', availableSlots: ['Tue 14-17', 'Fri 9-11'] },
    { id: '3', name: 'Dr. Williams', specialization: 'Oncology', contact: 'williams@example.com', availableSlots: ['Mon 13-16', 'Thu 10-12'] },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 text-center">
        <DashboardButton onClick={onBack} label="&larr; Back to Dashboard" />
      </div>
      <h1 className="text-3xl font-bold text-[#664147] mb-6 text-center">Edit Veterinarian Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {veterinarians.map((vet) => (
          <div key={vet.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-[#664147] mb-2">{vet.name}</h2>
            <p className="text-gray-700 mb-1"><strong>Specialization:</strong> {vet.specialization}</p>
            <p className="text-gray-700 mb-1"><strong>Contact:</strong> {vet.contact}</p>
            <div className="mt-2">
              <h3 className="text-md font-semibold text-gray-600">Available Slots:</h3>
              <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                {vet.availableSlots.map(slot => <li key={slot}>{slot}</li>)}
              </ul>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Edit</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-[#664147] mb-4">Add New Veterinarian</h2>
        {/* Placeholder for Add Veterinarian Form */}
        <form className="space-y-4">
          <div>
            <label htmlFor="vetName" className="block text-sm font-medium text-gray-700">Name:</label>
            <input type="text" id="vetName" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="vetSpecialization" className="block text-sm font-medium text-gray-700">Specialization:</label>
            <input type="text" id="vetSpecialization" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="vetContact" className="block text-sm font-medium text-gray-700">Contact:</label>
            <input type="text" id="vetContact" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          {/* TODO: Add available slots input */}
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Add Veterinarian</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVeterinariansView;
