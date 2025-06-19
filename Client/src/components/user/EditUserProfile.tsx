import React, { useState, useEffect } from "react";

interface EditUserProfileProps {
  initialEmail: string;
  initialPhone: string;
  initialCity?: string;
  initialStreet?: string;
  initialPostalCode?: string;
  onSave: (data: { 
    email: string; 
    phone: string;
    city: string;
    street?: string;
    postalCode?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const EditUserProfile: React.FC<EditUserProfileProps> = ({
  initialEmail,
  initialPhone,
  initialCity = "",
  initialStreet = "",
  initialPostalCode = "",
  onSave,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  // Form field states
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [city, setCity] = useState(initialCity);
  const [street, setStreet] = useState(initialStreet);
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  
  // Address change tracking
  const [originalCity, setOriginalCity] = useState(initialCity);
  const [originalStreet, setOriginalStreet] = useState(initialStreet);
  const [cityChanged, setCityChanged] = useState(false);
  const [streetChanged, setStreetChanged] = useState(false);
  
  // Validation states
  const [errorMessage, setErrorMessage] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [phoneValid, setPhoneValid] = useState(true);
  const [postalCodeValid, setPostalCodeValid] = useState(true);

  // Initialize form data when props change
  useEffect(() => {
    setEmail(initialEmail);
    setPhone(initialPhone);
    setCity(initialCity);
    setStreet(initialStreet);
    setPostalCode(initialPostalCode);
    setOriginalCity(initialCity);
    setOriginalStreet(initialStreet);
    setCityChanged(false);
    setStreetChanged(false);
    setErrorMessage("");
    setEmailValid(true);
    setPhoneValid(true);
    setPostalCodeValid(true);
  }, [initialEmail, initialPhone, initialCity, initialStreet, initialPostalCode]);

  // Update error message when error prop changes
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  // Check if postal code needs to be updated when address changes
  useEffect(() => {
    if ((cityChanged || streetChanged) && initialPostalCode) {
      if (postalCode === initialPostalCode) {
        setPostalCodeValid(false);
        setErrorMessage("Please clear or update postal code when changing address");
      }
    }
  }, [city, street, initialPostalCode, postalCode, cityChanged, streetChanged]);
  // Validation functions
  const isValidEmail = (email: string): boolean => {
    return /^\S+@\S+\.com$/.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    return /^05\d{8}$/.test(phone);
  };
  
  const isValidPostalCode = (postalCode: string): boolean => {
    if (!postalCode) return true;
    return /^\d{7}$/.test(postalCode);
  };

  // Event handlers
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    setCityChanged(newCity !== originalCity);
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStreet = e.target.value;
    setStreet(newStreet);
    setStreetChanged(newStreet !== originalStreet);
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPostalCode = e.target.value;
    setPostalCode(newPostalCode);
    
    // Clear address-change related errors when postal code is updated
    if (cityChanged || streetChanged) {
      setPostalCodeValid(true);
      if (errorMessage === "Please clear or update postal code when changing address") {
        setErrorMessage("");
      }
    }
  };

  const handleSubmit = () => {
    // Validate all fields
    const emailOk = isValidEmail(email);
    const phoneOk = isValidPhone(phone);
    const postalCodeOk = isValidPostalCode(postalCode);


    setEmailValid(emailOk);
    setPhoneValid(phoneOk);
    setPostalCodeValid(postalCodeOk);

    // Check address change postal code rule
    if ((cityChanged || streetChanged) && initialPostalCode && postalCode === initialPostalCode) {
      setPostalCodeValid(false);
      setErrorMessage("Please clear or update postal code when changing address");
      return;
    }

    // Check other validations
    if (!emailOk && !phoneOk) {
      setErrorMessage("Invalid Information - Email and Phone Number");
      return;
    }
    if (!emailOk) {
      setErrorMessage("Invalid Information - Email");
      return;
    }
    if (!phoneOk) {
      setErrorMessage("Invalid Information - Phone Number");
      return;
    }    
    if (!postalCodeOk) {
      setErrorMessage("Invalid Postal Code - must be exactly 7 digits");
      return;
    }    // All validations passed
    setErrorMessage("");
    onSave({ email, phone, city, street, postalCode });
  };

  // Common input field style classes
  const inputBaseClasses = "mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-[var(--color-skyDark)] focus:border-[var(--color-skyDark)] text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mobile:text-xs mobile:py-1 mobile:px-2";
  const inputStyle = { fontSize: '16px', fontFamily: 'monospace', letterSpacing: '0.01em' };
  const labelClasses = "block text-base font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[120px] sm:min-w-[120px] mb-1 sm:mb-0";
  
  return (
    <div className="bg-[var(--color-cream)] dark:bg-[#58383E] p-6 rounded-xl shadow-md mb-6 text-[var(--color-greyText)] dark:text-gray-200 w-full mobile:rounded-lg mobile:shadow-sm mobile:text-sm mobile:max-w-none mobile:px-4 mobile:w-[95vw]">
      <h3 className="text-xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mb-4 min-w-[220px] h-12 flex items-center text-left justify-start sm:justify-center">
        <span className="block mobile:hidden w-full mobile:text-xl mobile:text-left">Edit Information</span>
      </h3>
      <div className="space-y-4">
        {/* Email field */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label className={labelClasses}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputBaseClasses} ${
              emailValid ? "border-gray-300 dark:border-gray-600" : "border-red-500 dark:border-red-400"
            } text-ellipsis overflow-x-auto sm:text-clip`}
            style={inputStyle}
            inputMode="email"
            disabled={isLoading}
          />
        </div>
        
        {/* Phone field */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label className={labelClasses}>Phone:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${inputBaseClasses} ${
              phoneValid ? "border-gray-300 dark:border-gray-600" : "border-red-500 dark:border-red-400"
            }`}
            style={inputStyle}
            inputMode="tel"
            disabled={isLoading}
          />
        </div>
        
        {/* City field */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label className={labelClasses}>City:</label>
          <input
            type="text"
            value={city}
            onChange={handleCityChange}
            className={`${inputBaseClasses} border-gray-300 dark:border-gray-600`}
            style={inputStyle}
            disabled={isLoading}
          />
        </div>
        
        {/* Street field */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label className={labelClasses}>Street:</label>
          <input
            type="text"
            value={street}
            onChange={handleStreetChange}
            className={`${inputBaseClasses} border-gray-300 dark:border-gray-600`}
            style={inputStyle}
            disabled={isLoading}
          />
        </div>
        
        {/* Postal Code field */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label className={labelClasses}>Postal Code:</label>
          <input
            type="text"
            value={postalCode}
            onChange={handlePostalCodeChange}
            className={`${inputBaseClasses} ${
              postalCodeValid ? "border-gray-300 dark:border-gray-600" : "border-red-500 dark:border-red-400"
            }`}
            style={inputStyle}
            inputMode="numeric"
            placeholder=""
            maxLength={7}
            disabled={isLoading}
          />
        </div>        {/* Error message */}
        {errorMessage && (
          <div className="text-red-600 dark:text-red-400 py-2 mt-2 mb-2 mobile:py-4 mobile:px-2 mobile:border mobile:border-red-300 mobile:rounded-md mobile:bg-red-50 dark:mobile:bg-red-950 dark:mobile:border-red-800">
            <span className="hidden sm:inline text-[16px]">{errorMessage}</span>
            <span className="inline sm:hidden text-[10px]">{errorMessage}</span>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex flex-row pt-4 w-full sm:justify-end sm:gap-3 justify-between gap-4">
          <button
            onClick={handleSubmit}
            className={`px-2 py-1 bg-[var(--color-wine)] dark:bg-[#44292e] text-white rounded-lg hover:bg-[var(--color-wineDark)] dark:hover:bg-[#4A2F33] font-semibold transition-colors duration-150 
              sm:w-24 sm:text-base w-[45%] text-xs
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="px-2 py-1 bg-[var(--color-redButton)] dark:bg-[#ff7070] text-white dark:text-[#FDF6F0] rounded-lg hover:bg-[var(--color-sky)] dark:hover:bg-[#ff9b9b] font-semibold transition-colors duration-150
              sm:w-24 sm:text-base w-[45%] text-xs"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserProfile;
