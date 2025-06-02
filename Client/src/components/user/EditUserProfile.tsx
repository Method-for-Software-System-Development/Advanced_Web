import React, { useState, useEffect } from "react";

interface EditUserProfileProps {
  initialEmail: string;
  initialPhone: string;
  onSave: (data: { email: string; phone: string }) => void;
  onCancel: () => void;
}

const EditUserProfile: React.FC<EditUserProfileProps> = ({
  initialEmail,
  initialPhone,
  onSave,
  onCancel,
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
    <div className="bg-[var(--color-cream)] p-6 rounded-xl shadow-md mb-6 text-[var(--color-greyText)] mobile:w-full">
      <h3 className="text-xl font-bold text-[var(--color-wine)] mb-4 min-w-[220px] h-12 flex items-center justify-center">
        <span className="block mobile:hidden">Edit Information</span>
        <span className="hidden mobile:block">Edit Contact Information</span>
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="block text-base font-semibold text-[var(--color-wine)] min-w-[120px]">
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 w-full px-3 py-2 border ${
              emailValid ? "border-gray-300" : "border-red-500"
            } rounded-md shadow-sm focus:ring-[var(--color-skyDark)] focus:border-[var(--color-skyDark)] text-base bg-white`}
            autoComplete="email"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="block text-base font-semibold text-[var(--color-wine)] min-w-[120px]">
            Phone:
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`mt-1 w-full px-3 py-2 border ${
              phoneValid ? "border-gray-300" : "border-red-500"
            } rounded-md shadow-sm focus:ring-[var(--color-skyDark)] focus:border-[var(--color-skyDark)] text-base bg-white`}
            autoComplete="tel"
          />
        </div>
        {errorMessage && (
          <div className="text-red-600 text-sm pt-1">{errorMessage}</div>
        )}
        <div className="flex flex-row justify-end gap-3 pt-4 w-full">
          <button
            onClick={handleSubmit}
            className="w-36 px-4 py-2 bg-[var(--color-wine)] text-white rounded-lg hover:bg-[var(--color-wineDark)] font-semibold text-base transition-colors duration-150"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="w-36 px-4 py-2 bg-[var(--color-skyDark)] text-[var(--color-wine)] rounded-lg hover:bg-[var(--color-sky)] text-base font-semibold transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserProfile;
