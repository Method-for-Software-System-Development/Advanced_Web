import React, { useState } from "react";
import axios from "axios";

interface SignUpFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}



const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onCancel }) => {
  /* form state */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPwd, setRepeatPwd] = useState("");
  const [street, setStreet] = useState("");  
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  

  /* helpers */
  const isEmail = (v: string) => /[^@]+@[^.]+\..+/.test(v);
  const isPhone = (v: string) => /^(\+?\d{7,15})$/.test(v);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Client-side validation (before server)
  if (!firstName || !lastName) return setMsg("Name is required");
  if (!isEmail(email)) return setMsg("Invalid email");
  if (!isPhone(phone)) return setMsg("Invalid phone");
  if (!street) return setMsg("Street is required"); 
  if (!city) return setMsg("City is required");
  if (password.length < 6) return setMsg("Password ≥ 6 chars");
  if (password !== repeatPwd) return setMsg("Passwords mismatch");

  setMsg("Registering…");

  try {
    /**
     * Send a POST request to our backend API endpoint to register a new user.
     * The API is expected to respond with { message, user } on success,
     * or { error } on failure.
     */
    const response = await axios.post("http://localhost:3000/api/users/register", {
      firstName, lastName, email, phone, password,street, city, postalCode
    });

    // In Axios, response.data contains the returned JSON object
    setMsg("Account created! Redirecting…");
    setTimeout(onSuccess, 1500);

  } catch (err: any) {
    // Axios errors may be in err.response.data or just err.message
    if (err.response && err.response.data && err.response.data.error) {
      setMsg(err.response.data.error);
    } else {
      setMsg("Network error. Please try again.");
    }
  }
};


  return (
    <div>
      <h2 className="mb-2 text-3xl font-bold text-center text-[#4A3F35]">Create Account</h2>
      <p className="mb-6 text-sm text-center text-gray-500">All fields marked * are required</p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 overflow-y-auto pr-1 max-h-[60vh]"
      >
        {/* First Name */}
        <div>
          <label className="text-sm font-medium text-[#4A3F35]">First Name *</label>
          <input value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-200" required />
        </div>

        {/* Last Name */}
        <div>
          <label className="text-sm font-medium text-[#4A3F35]">Last Name *</label>
          <input value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-200" required />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-[#4A3F35]">Email *</label>
          <input type="email" placeholder="example@gmail.com"  value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-200" required  />
          <p className="mt-1 text-xs text-gray-500">We'll never share your email with anyone else.</p>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium text-[#4A3F35]">Phone *</label>
          <input type="tel" placeholder="e.g. +972512345678" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-200" required />
          <p className="mt-1 text-xs text-gray-500">Include country code, digits only.</p>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-[#4A3F35]">Password *</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-200" required />
          <p className="mt-1 text-xs text-gray-500">Minimum 6 characters.</p>
        </div>

        {/* Repeat Password */}
        <div>
          <label className="text-sm font-medium text-[#4A3F35]">Repeat Password *</label>
          <input type="password" value={repeatPwd} onChange={e=>setRepeatPwd(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-200" required />
          <p className="mt-1 text-xs text-gray-500">Must match the password exactly.</p>
        </div>

        {/* Street */}
        <div>
          <label className="text-sm font-medium text-[#4A3F35]">Street *</label>
          <input value={street} onChange={e=>setStreet(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-200" required />
        </div>
        
        {/* City */}
        <div>
          <label className="text-sm font-medium text-[#4A3F35]">City *</label>
          <input value={city} onChange={e=>setCity(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-200" required />
        </div>


        {/* Postal Code */}
        <div>
          <label className="text-sm font-medium text-[#4A3F35]">Postal Code</label>
          <input value={postalCode} onChange={e=>setPostalCode(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-blue-200" />
        </div>

        <button className="w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create Account</button>
        {onCancel && <button type="button" onClick={onCancel} className="w-full mt-2 text-sm text-gray-500 hover:underline">Back to Sign In</button>}
        {msg && <p className="mt-2 text-center text-sm text-gray-700">{msg}</p>}
      </form>
    </div>
  );
};

export default SignUpForm;
