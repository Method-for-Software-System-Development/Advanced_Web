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
    return email.includes("@") && email.endsWith(".com");
  };

  const isValidPhone = (phone: string): boolean => {
    return /^\d{10}$/.test(phone) && phone.startsWith("05");
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
    <div className="bg-gray-50 p-4 rounded-lg shadow-lg mb-6">
      <h3 className="text-xl font-semibold text-[#664147] mb-4">Edit Contact Information</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 w-full px-3 py-2 border ${
              emailValid ? "border-gray-300" : "border-red-500"
            } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`mt-1 w-full px-3 py-2 border ${
              phoneValid ? "border-gray-300" : "border-red-500"
            } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
        </div>

        {errorMessage && (
          <div className="text-red-600 text-sm pt-1">{errorMessage}</div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserProfile;
