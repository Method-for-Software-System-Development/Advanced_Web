import React, { useState, useEffect } from "react";
import { userService } from "../../services/userService";

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
  
  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  // Password validation
  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);

    try {
      // Get user ID from session storage
      const clientRaw = sessionStorage.getItem("client");
      if (!clientRaw) {
        setPasswordError("User session not found. Please log in again.");
        return;
      }
      
      const client = JSON.parse(clientRaw);
      
      await userService.changePassword(client._id, {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess("");
        setShowPasswordSection(false);
      }, 3000);

    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
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
  const labelClasses = "block text-base font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[140px] sm:min-w-[140px] mb-1 sm:mb-0";
  
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
        </div>

        {/* Change Password Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              setPasswordError("");
              setPasswordSuccess("");
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            className="flex items-center justify-between w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
            disabled={isLoading}
          >
            <span className="text-base font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0]">
              Change Password
            </span>
            <svg
              className={`w-5 h-5 text-[var(--color-wine)] dark:text-[#FDF6F0] transform transition-transform duration-200 ${
                showPasswordSection ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPasswordSection && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {/* Current Password */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <label className={labelClasses}>Current Password:</label>
                <div className="relative w-full">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`${inputBaseClasses} border-gray-300 dark:border-gray-600 pr-12`}
                    style={inputStyle}
                    disabled={isLoading || isChangingPassword}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    disabled={isLoading || isChangingPassword}
                  >
                    {showCurrentPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <label className={labelClasses}>New Password:</label>
                <div className="relative w-full">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`${inputBaseClasses} border-gray-300 dark:border-gray-600 pr-12`}
                    style={inputStyle}
                    disabled={isLoading || isChangingPassword}
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    disabled={isLoading || isChangingPassword}
                  >
                    {showNewPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <label className={labelClasses}>Confirm Password:</label>
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputBaseClasses} border-gray-300 dark:border-gray-600 pr-12`}
                    style={inputStyle}
                    disabled={isLoading || isChangingPassword}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    disabled={isLoading || isChangingPassword}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Error/Success Messages */}
              {passwordError && (
                <div className="text-red-600 dark:text-red-400 py-2 px-3 border border-red-300 dark:border-red-600 rounded-md bg-red-50 dark:bg-red-950">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="text-green-600 dark:text-green-400 py-2 px-3 border border-green-300 dark:border-green-600 rounded-md bg-green-50 dark:bg-green-950">
                  {passwordSuccess}
                </div>
              )}

              {/* Change Password Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  className={`px-4 py-2 bg-[var(--color-wine)] dark:bg-[#44292e] text-white rounded-lg hover:bg-[var(--color-wineDark)] dark:hover:bg-[#4A2F33] font-semibold transition-colors duration-150 ${
                    isChangingPassword ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading || isChangingPassword}
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}
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
