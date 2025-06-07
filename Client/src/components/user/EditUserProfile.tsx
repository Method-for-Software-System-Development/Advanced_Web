import React, { useState, useEffect } from "react";

interface EditUserProfileProps {
  initialEmail: string;
  initialPhone: string;
  onSave: (data: { email: string; phone: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const EditUserProfile: React.FC<EditUserProfileProps> = ({
  initialEmail,
  initialPhone,
  onSave,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);

  const [errorMessage, setErrorMessage] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [phoneValid, setPhoneValid] = useState(true);

  useEffect(() => {
    setEmail(initialEmail);
    setPhone(initialPhone);
    setErrorMessage("");
    setEmailValid(true);
    setPhoneValid(true);
  }, [initialEmail, initialPhone]);

  // Update local error message when error prop changes
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  const isValidEmail = (email: string): boolean => {
    // Must have text before @, then @, then text, then .com at the end
    return /^\S+@\S+\.com$/.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    // Must be 10 digits, only numbers, starts with 05
    return /^05\d{8}$/.test(phone);
  };

  const handleSubmit = () => {
    const emailOk = isValidEmail(email);
    const phoneOk = isValidPhone(phone);

    setEmailValid(emailOk);
    setPhoneValid(phoneOk);

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

    setErrorMessage("");
    onSave({ email, phone });
  };
  return (
    <div className="bg-[var(--color-cream)] dark:bg-[#58383E] p-6 rounded-xl shadow-md mb-6 text-[var(--color-greyText)] dark:text-gray-200 w-full mobile:rounded-lg mobile:shadow-sm mobile:text-sm mobile:max-w-none mobile:px-4 mobile:w-[95vw]">
      <h3 className="text-xl font-bold text-[var(--color-wine)] dark:text-[#FDF6F0] mb-4 min-w-[220px] h-12 flex items-center text-left justify-start sm:justify-center">
        <span className="block mobile:hidden w-full mobile:text-xl mobile:text-left">Edit Information</span>
      </h3>
      <div className="space-y-4">        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label className="block text-base font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[120px] sm:min-w-[120px] mb-1 sm:mb-0">
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 w-full px-3 py-2 border ${
              emailValid ? "border-gray-300 dark:border-gray-600" : "border-red-500 dark:border-red-400"
            } rounded-md shadow-sm focus:ring-[var(--color-skyDark)] focus:border-[var(--color-skyDark)] text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-ellipsis overflow-x-auto sm:text-clip mobile:text-xs mobile:py-1 mobile:px-2`}
            autoComplete="email"
            style={{ fontSize: '16px', fontFamily: 'monospace', letterSpacing: '0.01em' }}
            inputMode="email"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <label className="block text-base font-semibold text-[var(--color-wine)] dark:text-[#FDF6F0] min-w-[120px] sm:min-w-[120px] mb-1 sm:mb-0">
            Phone:
          </label>          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`mt-1 w-full px-3 py-2 border ${
              phoneValid ? "border-gray-300 dark:border-gray-600" : "border-red-500 dark:border-red-400"
            } rounded-md shadow-sm focus:ring-[var(--color-skyDark)] focus:border-[var(--color-skyDark)] text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mobile:text-xs mobile:py-1 mobile:px-2`}
            autoComplete="tel"
            style={{ fontSize: '16px', fontFamily: 'monospace', letterSpacing: '0.01em' }}
            inputMode="tel"
            disabled={isLoading}
          />
        </div>
        {errorMessage && (
          <div className="text-red-600 dark:text-red-400 text-sm pt-1 mobile-error-text">{errorMessage}</div>
        )}
        <div className="flex flex-row justify-end gap-3 pt-4 w-full">
          <button
            onClick={handleSubmit}
            className={`w-24 px-2 py-1 bg-[var(--color-wine)] dark:bg-[#58383E] text-white rounded-lg hover:bg-[var(--color-wineDark)] dark:hover:bg-[#4A2F33] font-semibold text-base transition-colors duration-150 mobile:w-20 mobile:px-1 mobile:py-1 mobile:text-xs ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="w-24 px-2 py-1 bg-[var(--color-skyDark)] dark:bg-[#4A7C7D] text-[var(--color-wine)] dark:text-[#FDF6F0] rounded-lg hover:bg-[var(--color-sky)] dark:hover:bg-[#3A6C6D] text-base font-semibold transition-colors duration-150 mobile:w-20 mobile:px-1 mobile:py-1 mobile:text-xs"
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
