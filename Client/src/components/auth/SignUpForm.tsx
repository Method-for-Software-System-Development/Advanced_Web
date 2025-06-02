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
        firstName, lastName, email, phone, password, street, city, postalCode
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
      <h2 className="mb-1 text-3xl font-bold text-center text-grayText dark:text-white">Create Account</h2>
      <p className="mb-6 text-sm text-center text-gray-400">All fields marked * are required</p>

      <form
        onSubmit={handleSubmit}
        className="login-form space-y-4 overflow-y-auto pr-1 max-h-[60vh] login-custom-scrollbar"
      >
        {/* First Name */}
        <div>
          <label>First Name *</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} required />
        </div>

        {/* Last Name */}
        <div>
          <label>Last Name *</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} required />
        </div>

        {/* Email */}
        <div>
          <label>Email *</label>
          <input type="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <p>We'll never share your email with anyone else.</p>
        </div>

        {/* Phone */}
        <div>
          <label>Phone *</label>
          <input type="tel" placeholder="e.g. +972512345678" value={phone} onChange={e => setPhone(e.target.value)} required />
          <p>Include country code, digits only.</p>
        </div>

        {/* Password */}
        <div>
          <label>Password *</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <p>Minimum 6 characters.</p>
        </div>

        {/* Repeat Password */}
        <div>
          <label>Repeat Password *</label>
          <input type="password" value={repeatPwd} onChange={e => setRepeatPwd(e.target.value)} required />
          <p>Must match the password exactly.</p>
        </div>

        {/* Street */}
        <div>
          <label>Street Address *</label>
          <input value={street} onChange={e => setStreet(e.target.value)} required />
        </div>

        {/* City */}
        <div>
          <label>City *</label>
          <input value={city} onChange={e => setCity(e.target.value)} required />
        </div>


        {/* Postal Code */}
        <div>
          <label>Postal Code</label>
          <input value={postalCode} onChange={e => setPostalCode(e.target.value)} />
        </div>

        <button className="mt-5 w-full py-2 font-bold text-white bg-wine rounded-lg hover:bg-wineDark cursor-pointer">Create Account</button>
        {onCancel && <button type="button" onClick={onCancel} className="block mx-auto text-sm text-grayText dark:text-white hover:underline cursor-pointer">Back to Sign In</button>}
        {msg && <p className="mt-2 text-center text-sm text-grayText dark:text-white">{msg}</p>}
      </form>
    </div>
  );
};

export default SignUpForm;
