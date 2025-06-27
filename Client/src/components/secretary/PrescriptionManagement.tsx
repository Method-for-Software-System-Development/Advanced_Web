import React, { useState, useEffect } from 'react';
import { prescriptionService } from '../../services/prescriptionService';
import { patientService } from '../../services/patientService';
import { Prescription, Patient, Pet, Medicine } from '../../types';
import ClientSearchPrescription from './prescription/ClientSearchPrescription';
import PetSelectionPrescription from './prescription/PetSelectionPrescription';
import MedicineSearch from './prescription/MedicineSearch';

interface PrescriptionManagementProps {
  onBack: () => void;
}

interface PrescriptionFormData {
  medicineType: string;
  medicineName: string;
  quantity: number;
  expirationDate: string;
  referralType: string;
  petId: string;
}

const initialFormData: PrescriptionFormData = {
  medicineType: '',
  medicineName: '',
  quantity: 1,
  expirationDate: '',
  referralType: '',
  petId: ''
};

const PrescriptionManagement: React.FC<PrescriptionManagementProps> = ({ onBack }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false); const [formData, setFormData] = useState<PrescriptionFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); const [statusFilter, setStatusFilter] = useState<'all' | 'fulfilled' | 'pending'>('all');
  const [expiredFilter, setExpiredFilter] = useState<'all' | 'expired' | 'not-expired'>('not-expired');

  // New state for search functionality
  const [selectedClient, setSelectedClient] = useState<Patient | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [clientPets, setClientPets] = useState<Pet[]>([]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [prescriptionsData, patientsData] = await Promise.all([
        prescriptionService.getAllPrescriptions(),
        patientService.getAllPatients()
      ]);

      setPrescriptions(prescriptionsData);
      setPatients(patientsData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    if (!selectedClient) {
      setError('Please select a patient.');
      setIsSubmitting(false);
      return;
    }

    if (!selectedPetId) {
      setError('Please select a pet.');
      setIsSubmitting(false);
      return;
    } if (!formData.medicineName.trim()) {
      setError('Please enter a medicine name.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.medicineType.trim()) {
      setError('Please enter a medicine type.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.referralType.trim()) {
      setError('Please enter a referral type.');
      setIsSubmitting(false);
      return;
    }

    const expirationDate = new Date(formData.expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison

    if (expirationDate <= today) {
      setError('Expiration date must be in the future.');
      setIsSubmitting(false);
      return;
    }

    if (formData.quantity < 1) {
      setError('Quantity must be at least 1.');
      setIsSubmitting(false);
      return;
    }

    try {
      const prescriptionData = {
        ...formData,
        petId: selectedPetId,
        issueDate: new Date().toISOString(),
        fulfilled: false
      };
      await prescriptionService.createPrescription(prescriptionData);
      await loadData(); // Refresh data
      setShowAddForm(false);
      setFormData(initialFormData);
      setSelectedClient(null);
      setSelectedPetId(null);
      setClientPets([]);
      setSuccessMessage('Prescription created successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Failed to create prescription. Please try again.');
      console.error('Error creating prescription:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFulfilled = async (prescriptionId: string, currentStatus: boolean) => {
    try {
      await prescriptionService.updatePrescription(prescriptionId, { fulfilled: !currentStatus });
      await loadData(); // Refresh data
      setSuccessMessage(`Prescription marked as ${!currentStatus ? 'fulfilled' : 'pending'}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Failed to update prescription status.');
      console.error('Error updating prescription:', err);
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return; try {
      await prescriptionService.deletePrescription(prescriptionId);
      await loadData(); // Refresh data
      setSuccessMessage('Prescription deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Failed to delete prescription.');
      console.error('Error deleting prescription:', err);
    }
  };
  const getPatientInfo = (prescription: Prescription) => {
    // Find the patient who owns the pet
    const patient = patients.find(p => {
      return p.pets.some(pet => {
        const petId = typeof pet === 'string' ? pet : pet._id;
        return petId === prescription.petId;
      });
    });

    // Find the pet details
    let petName = 'Unknown Pet';
    if (patient) {
      const pet = patient.pets.find(pet => {
        const petId = typeof pet === 'string' ? pet : pet._id;
        return petId === prescription.petId;
      });
      if (pet && typeof pet === 'object') {
        petName = pet.name;
      }
    }

    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';

    return { patientName, petName };
  }; const filteredPrescriptions = prescriptions
    .filter(prescription => {
      const { patientName, petName } = getPatientInfo(prescription);
      const searchLower = searchTerm.toLowerCase();

      // Search filter
      const matchesSearch = (
        prescription.medicineType.toLowerCase().includes(searchLower) ||
        (prescription.medicineName && prescription.medicineName.toLowerCase().includes(searchLower)) ||
        patientName.toLowerCase().includes(searchLower) ||
        petName.toLowerCase().includes(searchLower) ||
        prescription.referralType.toLowerCase().includes(searchLower)
      );

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'fulfilled' && prescription.fulfilled) ||
        (statusFilter === 'pending' && !prescription.fulfilled);
      // Expired filter
      const today = new Date();
      const expirationDate = new Date(prescription.expirationDate);
      const isExpired = expirationDate <= today && !prescription.fulfilled;
      const matchesExpiredFilter =
        expiredFilter === 'all' ||
        (expiredFilter === 'expired' && isExpired) ||
        (expiredFilter === 'not-expired' && !isExpired);

      return matchesSearch && matchesStatus && matchesExpiredFilter;
    })
    .sort((a, b) => {
      // Sort by issue date - most recent first (descending order)
      const dateA = new Date(a.issueDate).getTime();
      const dateB = new Date(b.issueDate).getTime();
      return dateB - dateA;
    });
  const handleClientSelect = (client: Patient) => {
    setSelectedClient(client);
    setSelectedPetId(null);
    setFormData({ ...formData, petId: '' });

    // Set client pets for selection - only show active pets
    if (client && client.pets) {
      const pets: Pet[] = client.pets.filter((pet): pet is Pet =>
        typeof pet === 'object' && pet !== null && pet.isActive === true
      );
      setClientPets(pets);
    } else {
      setClientPets([]);
    }
    // Update selectedPatientId for backward compatibility if needed
  };
  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId);
    // Clear form data when changing pets, but keep the selected petId
    setFormData({
      ...initialFormData,
      petId
    });
  }; const handleMedicineChange = (medicineName: string, medicineType: string, referralType: string) => {
    const newFormData = {
      ...formData,
      medicineName,
      medicineType,
      referralType
    };

    setFormData(newFormData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading prescriptions...</p>
      </div>
    );
  }
  return (
    <>
      <div className="max-w-7xl mx-auto mt-5 mb-10 p-4 md:p-8 bg-white dark:bg-darkModeLight rounded-xl shadow-2xl">

        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-wine font-[Nunito] dark:text-white mb-1">&#128138; Add Prescription</h1>
          <p className="text-lg text-grayText dark:text-lightGrayText">Create new prescriptions for patients</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 rounded-lg">
            {successMessage}
          </div>
        )}        {/* Prescription Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-100  p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 ">Total Prescriptions</h3>
            <p className="text-2xl font-bold text-blue-900 ">{prescriptions.length}</p>
          </div>
          <div className="bg-green-100  p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 ">Fulfilled</h3>
            <p className="text-2xl font-bold text-green-900 ">
              {prescriptions.filter(p => p.fulfilled).length}
            </p>
          </div>
          <div className="bg-yellow-100  p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 ">Pending</h3>
            <p className="text-2xl font-bold text-yellow-900 ">
              {prescriptions.filter(p => !p.fulfilled).length}
            </p>
          </div>
          <div className="bg-red-100  p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 ">Expired</h3>
            <p className="text-2xl font-bold text-red-900 ">
              {prescriptions.filter(p => {
                const today = new Date();
                const expirationDate = new Date(p.expirationDate);
                return expirationDate <= today && !p.fulfilled;
              }).length}
            </p>
          </div>
        </div>{/* Expiration Warnings */}
        {(() => {
          const today = new Date();
          const expiringSoonPrescriptions = prescriptions.filter(p => {
            const expirationDate = new Date(p.expirationDate);
            const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiration <= 15 && daysUntilExpiration > 0 && !p.fulfilled;
          }).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

          if (expiringSoonPrescriptions.length > 0) {
            return (
              <div className="mb-8">
                <div className="p-4 bg-yellow-50  border border-yellow-200  rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-600  text-xl">⏰</span>
                    <h3 className="text-lg font-semibold text-yellow-800 ">
                      Expiring Soon ({expiringSoonPrescriptions.length})
                    </h3>
                  </div>
                  <p className="text-yellow-700  text-sm mb-3">
                    These prescriptions will expire within 15 days.
                  </p>
                  <div className="h-32 overflow-y-auto space-y-2 pr-2">
                    {expiringSoonPrescriptions.map(p => {
                      const { patientName, petName } = getPatientInfo(p);
                      const expirationDate = new Date(p.expirationDate);
                      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={p._id} className="text-sm text-yellow-800  bg-yellow-100  p-2 rounded flex-shrink-0">
                          <strong>{p.medicineType}</strong> for {petName} ({patientName}) - Expires in {daysUntilExpiration} days ({new Date(p.expirationDate).toLocaleDateString()})
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}        {/* Action Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) {
                // Reset form when canceling
                setFormData(initialFormData);
                setSelectedClient(null);
                setSelectedPetId(null);
                setClientPets([]);
              }
            }}
            className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 ${
              showAddForm 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {showAddForm ? 'Cancel' : '+ Add New Prescription'}
          </button>
        </div>

        {/* Add Prescription Form */}
        {showAddForm && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border">
            <h3 className="text-xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0] mb-4">Create New Prescription</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-6">
                {/* Client Search Section */}
                <div>
                  <ClientSearchPrescription
                    onClientSelect={handleClientSelect}
                    selectedClient={selectedClient}
                  />
                </div>

                {/* Pet Selection Section */}
                {selectedClient && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Pet *
                    </label>
                    <PetSelectionPrescription
                      pets={clientPets}
                      selectedPetId={selectedPetId}
                      onPetSelect={handlePetSelect}
                      clientName={`${selectedClient.firstName} ${selectedClient.lastName}`}
                    />
                  </div>
                )}                {/* Medicine Search Section */}
                {selectedClient && selectedPetId && (
                  <div className="space-y-6">
                    <MedicineSearch
                      onMedicineChange={handleMedicineChange}
                      medicineName={formData.medicineName}
                      medicineType={formData.medicineType}
                      referralType={formData.referralType}
                      placeholder="Search for medicine by name, type, or referral..."
                    />

                    {/* Prescription Details - Always show once medicine section is visible */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-gray-200"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiration Date *
                        </label>
                        <input
                          type="date"
                          value={formData.expirationDate}
                          onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-gray-200"
                          min={new Date().toISOString().split('T')[0]} // Minimum date is today
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData(initialFormData);
                    setSelectedClient(null);
                    setSelectedPetId(null);
                    setClientPets([]);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        )}        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="searchPrescriptions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Prescriptions
            </label>
            <input
              type="text"
              id="searchPrescriptions"
              placeholder="Search by medicine, patient, pet, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-gray-200"
            />
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'fulfilled' | 'pending')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-gray-200"
            >
              <option value="all">All Prescriptions</option>
              <option value="pending">Pending Only</option>
              <option value="fulfilled">Fulfilled Only</option>
            </select>
          </div>          <div>
            <label htmlFor="expiredFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Expiration
            </label>
            <select
              id="expiredFilter"
              value={expiredFilter}
              onChange={(e) => setExpiredFilter(e.target.value as 'all' | 'expired' | 'not-expired')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-gray-200"
            >
              <option value="not-expired">Active Only</option>
              <option value="expired">Expired Only</option>
              <option value="all">All Prescriptions</option>
            </select>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#4A3F35] dark:text-[#FDF6F0]">
            All Prescriptions ({filteredPrescriptions.length})
          </h3>

          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No prescriptions found.</p>
            </div>
          ) : (
            <div className="grid gap-4">              {filteredPrescriptions.map((prescription) => {
              const { patientName, petName } = getPatientInfo(prescription); const expirationDate = new Date(prescription.expirationDate);
              const today = new Date();
              const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isExpiringSoon = daysUntilExpiration <= 15 && daysUntilExpiration > 0 && !prescription.fulfilled;
              const isExpired = daysUntilExpiration <= 0 && !prescription.fulfilled;

              return (
                <div
                  key={prescription._id}
                  className={`p-3 sm:p-4 border rounded-lg bg-gray-50 dark:bg-darkMode hover:shadow-md transition-shadow ${isExpired ? 'border-red-300 dark:border-red-600' :
                      isExpiringSoon ? 'border-yellow-300 dark:border-yellow-600' :
                        'border-gray-200 dark:border-gray-600'
                    }`}
                >
                  {/* Desktop layout*/}
                  <div className="hidden md:block">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-[#4A3F35] dark:text-[#FDF6F0]">
                            {prescription.medicineName || prescription.medicineType}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${prescription.fulfilled
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}
                          >
                            {prescription.fulfilled ? 'Fulfilled' : 'Pending'}
                          </span>
                          {isExpired && !prescription.fulfilled && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Expired
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <p><strong>Patient:</strong> {patientName}</p>
                          <p><strong>Pet:</strong> {petName}</p>
                          <p><strong>Medicine:</strong> {prescription.medicineName || 'N/A'}</p>
                          <p><strong>Type:</strong> {prescription.medicineType}</p>
                          <p><strong>Referral:</strong> {prescription.referralType}</p>
                          <p><strong>Quantity:</strong> {prescription.quantity}</p>
                          <p><strong>Expires:</strong> {new Date(prescription.expirationDate).toLocaleDateString()}</p>
                          <p><strong>Issued:</strong> {new Date(prescription.issueDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleToggleFulfilled(prescription._id, prescription.fulfilled)}
                          className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${prescription.fulfilled
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                        >
                          {prescription.fulfilled ? 'Mark Pending' : 'Mark Fulfilled'}
                        </button>
                        <button
                          onClick={() => handleDeletePrescription(prescription._id)}
                          className="px-3 py-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="md:hidden space-y-3">
                    {/* Header with medicine name and status badges on right */}
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="text-base font-semibold text-[#4A3F35] dark:text-[#FDF6F0] leading-tight flex-1">
                        {prescription.medicineName || prescription.medicineType}
                      </h4>

                      {/* Status badges */}
                      <div className="flex flex-wrap gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${prescription.fulfilled
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}
                        >
                          {prescription.fulfilled ? 'Fulfilled' : 'Pending'}
                        </span>
                        {isExpired && !prescription.fulfilled && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 whitespace-nowrap">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prescription details */}
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <p><strong>Patient:</strong> {patientName}</p>
                      <p><strong>Pet:</strong> {petName}</p>
                      <p><strong>Medicine:</strong> {prescription.medicineName || 'N/A'}</p>
                      <p><strong>Type:</strong> {prescription.medicineType}</p>
                      <p><strong>Referral:</strong> <span className="break-words">{prescription.referralType}</span></p>
                      <p><strong>Quantity:</strong> {prescription.quantity}</p>
                      <p><strong>Expires:</strong> {new Date(prescription.expirationDate).toLocaleDateString()}</p>
                      <p><strong>Issued:</strong> {new Date(prescription.issueDate).toLocaleDateString()}</p>
                    </div>

                    {/* Mobile action buttons - horizontal layout */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => handleToggleFulfilled(prescription._id, prescription.fulfilled)}
                        className={`px-3 py-2 text-xs font-semibold rounded transition-colors flex-1 ${prescription.fulfilled
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                      >
                        {prescription.fulfilled ? 'Mark Pending' : 'Mark Fulfilled'}
                      </button>
                      <button
                        onClick={() => handleDeletePrescription(prescription._id)}
                        className="px-3 py-2 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded transition-colors flex-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PrescriptionManagement;
