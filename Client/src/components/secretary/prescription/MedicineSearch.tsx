import React, { useState, useEffect, useRef } from 'react';
import { Medicine } from '../../../types';
import { medicineService } from '../../../services/medicineService';

/** Props for medicine search component with auto-complete functionality */
interface MedicineSearchProps {
  onMedicineChange: (medicineName: string, medicineType: string, referralType: string) => void;
  medicineName: string;
  medicineType: string;
  referralType: string;
  placeholder?: string;
}

/** Medicine search component with debounced auto-complete and auto-fill functionality */
const MedicineSearch: React.FC<MedicineSearchProps> = ({
  onMedicineChange,
  medicineName,
  medicineType,
  referralType,
  placeholder = "Enter medicine name..."
}) => {  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  /** Debounced search effect - searches medicines after 300ms delay */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (medicineName.trim().length >= 2 && inputFocused) {
        searchMedicines(medicineName);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [medicineName, inputFocused]);

  /** Click outside effect - closes dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Searches medicines via API and updates suggestions dropdown */
  const searchMedicines = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const results = await medicineService.searchMedicines(searchTerm);
      setSearchResults(results);
      // Only show suggestions if input is focused
      setShowSuggestions(results.length > 0 && inputFocused);
    } catch (error) {
      console.error('Error searching medicines:', error);
      setSearchResults([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  /** Handles medicine name input changes and resets auto-fill if manually edited */
  const handleMedicineNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    
    // If user is typing manually, reset auto-fill state
    if (isAutoFilled && name !== medicineName) {
      setIsAutoFilled(false);
    }
    
    onMedicineChange(name, medicineType, referralType);
  };

  /** Handles medicine selection from dropdown and auto-fills related fields */
  const handleMedicineSelect = (medicine: Medicine) => {
    setIsAutoFilled(true);
    
    // Call the parent callback
    onMedicineChange(medicine.Name, medicine.Type, medicine.Referral);
    
    // Force close dropdown and clear search results
    setShowSuggestions(false);
    setSearchResults([]);
    
    // Remove focus from input to ensure dropdown stays closed
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  /** Handles medicine type input changes and resets auto-fill state */
  const handleMedicineTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = e.target.value;
    setIsAutoFilled(false); // Reset auto-fill if manually edited
    onMedicineChange(medicineName, type, referralType);
  };

  /** Handles referral type input changes and resets auto-fill state */
  const handleReferralTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const referral = e.target.value;
    setIsAutoFilled(false); // Reset auto-fill if manually edited
    onMedicineChange(medicineName, medicineType, referral);
  };

  /** Sets input focus state and shows suggestions if available */
  const handleInputFocus = () => {
    setInputFocused(true);
    if (searchResults.length > 0) {
      setShowSuggestions(true);
    }
  };

  /** Handles input blur with delay to allow dropdown interactions */
  const handleInputBlur = () => {
    setInputFocused(false);
    // Delay hiding suggestions to allow for dropdown clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200); // Increased delay from 150ms to 200ms
  };
  return (
    <div className="space-y-4">
      {/* Medicine Name with Search Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Medicine Name *
        </label>        <input
          ref={inputRef}
          type="text"
          value={medicineName}
          onChange={handleMedicineNameChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-gray-200"
          placeholder={placeholder}
          required
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-9">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          </div>
        )}        {/* Search Results Dropdown */}
        {showSuggestions && searchResults.length > 0 && (
          <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((medicine) => (
              <div
                key={medicine._id}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  handleMedicineSelect(medicine);
                }}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {medicine.Name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {medicine.Type} • {medicine.Referral}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && searchResults.length === 0 && medicineName.trim().length >= 2 && !isLoading && (
          <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-xl">            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
              No medicines found for "{medicineName}"
            </div>
          </div>
        )}
      </div>      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medicine Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Medicine Type *
            {isAutoFilled && <span className="text-green-600 text-xs ml-2">(Auto-filled)</span>}
          </label>          <div className="relative">
            <input
              type="text"
              value={medicineType}
              onChange={handleMedicineTypeChange}
              readOnly={isAutoFilled}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-gray-200 ${
                isAutoFilled ? 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500 cursor-not-allowed' : ''
              }`}
              placeholder="e.g., Antibiotic, Anti-inflammatory, Pain Relief..."
              required
            />
            {isAutoFilled && (
              <button
                type="button"
                onClick={() => setIsAutoFilled(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-green-600 hover:text-green-800"
                title="Click to edit manually"
              >
                ✏️
              </button>
            )}
          </div>
        </div>

        {/* Referral Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Referral Type *
            {isAutoFilled && <span className="text-green-600 text-xs ml-2">(Auto-filled)</span>}
          </label>          <div className="relative">
            <input
              type="text"
              value={referralType}
              onChange={handleReferralTypeChange}
              readOnly={isAutoFilled}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:text-gray-200 ${
                isAutoFilled ? 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500 cursor-not-allowed' : ''
              }`}
              placeholder="e.g., Pain Management, Skin Infections, Heart Disease..."
              required
            />
            {isAutoFilled && (
              <button
                type="button"
                onClick={() => setIsAutoFilled(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-green-600 hover:text-green-800"
                title="Click to edit manually"
              >
                ✏️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineSearch;