import React, { useState, useEffect, } from "react";
import SignUpForm from "./SignUpForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../config/api';

interface LoginProps {
  onClose: () => void;
}

type Step = "login" | "signup" | "forgot-email" | "forgot-verify" | "forgot-reset";

const Login: React.FC<LoginProps> = ({ onClose }) => {
  const navigate = useNavigate();

  /* ─────────── Login state ─────────── */
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");

  /* ─────────── Forgot-password state ─────────── */
  const [fpEmail, setFpEmail] = useState("");
  const [fpUserCode, setFpUserCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fpMessage, setFpMessage] = useState("");

  /* ─────────── utils ─────────── */
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptcha(`${a + b}`);
    setCaptchaQuestion(`${a} + ${b} = ?`);
  };
  useEffect(() => generateCaptcha(), []);

  /* ─────────── handlers ─────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (captchaAnswer !== captcha) {
      setLoginMessage("Incorrect captcha answer.");
      generateCaptcha();
      return;
    }
    setLoginMessage("Logging in…");

    try {      /**
       * Send a POST request to the login endpoint.
       * The API should return { message, user } on success,
       * or { error } on failure.
       */
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password,
      });

      setLoginMessage("Login successful!");
      localStorage.setItem("client", JSON.stringify(response.data.user));
      //  to save the JWT token you got from the server
      localStorage.setItem("token", response.data.token);
      // Save the user's role for navbar/dashboard logic
      localStorage.setItem("role", response.data.user.role || "user");

      setTimeout(() => {
        onClose();
        navigate("/");
      }, 1000);
    } catch (err: any) {
      // Axios errors may be in err.response.data or just err.message
      if (err.response && err.response.data && err.response.data.error) {
        setLoginMessage(err.response.data.error);
      } else {
        setLoginMessage("Network error. Please try again.");
      }
    }
  };

  /**
 * Handles sending a password reset code to the user's email address.
 * 
 * - Validates that the email address is correctly formatted.
 * - Sends a POST request to the backend API to initiate the password reset process.
 * - Updates the UI with the result: either advances to the "verify code" step,
 *   or shows an appropriate error message.
 */
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate email format
    if (!fpEmail.includes("@")) {
      setFpMessage("Please enter a valid email.");
      return;
    }

    // Show loading message while sending the code
    setFpMessage("Sending verification code…");

    try {      /**
       * Send a POST request to the backend API endpoint for forgot password.
       * The API is expected to send a verification code to the email and return a success message.
       * On success, proceed to the code verification step.
       */
      await axios.post(`${API_URL}/users/forgot-password`, {
        email: fpEmail,
      });

      // Success: update UI and proceed to verification step
      setFpMessage(`Verification code sent to ${fpEmail}`);
      setStep("forgot-verify");
    } catch (err: any) {
      // Axios errors: Show error from response or network error
      if (err.response && err.response.data && err.response.data.error) {
        setFpMessage(err.response.data.error);
      } else {
        setFpMessage("Network error. Please try again.");
      }
    }
  };


  /**
  * Verifies the reset code entered by the user by sending it to the backend API.
  * If the code is valid, proceeds to the password reset step.
  * Otherwise, shows an error message.
  */
  const handleVerify = async (e: React.FormEvent) => {
    // Show loading message while verifying
    setFpMessage("Verifying code…");
    e.preventDefault();    try {
      // Send the email and code to the backend for verification
      await axios.post(`${API_URL}/users/verify-reset-code`, {
        email: fpEmail,
        code: fpUserCode,
      });

      // Success: proceed to reset password
      setFpMessage("Code verified. Choose new password.");
      setStep("forgot-reset");
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setFpMessage(err.response.data.error); // Show server error (like "Invalid or expired code")
      } else {
        setFpMessage("Network error. Please try again.");
      }
    }
  };


  /**
  * Submits the new password to the backend to complete the reset process.
  * Sends: { email, code, newPassword }
  * On success: notifies the user and returns to login.
  * On failure: displays an error.
  */
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation checks
    if (newPassword.length < 6) return setFpMessage("Password must be at least 6 chars.");
    if (newPassword !== confirmPassword) return setFpMessage("Passwords don't match.");

    setFpMessage("Saving new password...");    try {
      // API request to update password on the server
      await axios.post(`${API_URL}/users/reset-password`, {
        email: fpEmail,
        code: fpUserCode,
        password: newPassword,
      });

      setFpMessage("Password changed! You can now sign in.");
      setTimeout(() => {
        setStep("login");
        setFpMessage("");
        setNewPassword("");
        setConfirmPassword("");
        setFpUserCode("");
      }, 1500);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setFpMessage(err.response.data.error);
      } else {
        setFpMessage("Network error. Please try again.");
      }
    }
  };


  /* ─────────── UI ─────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-8 bg-white dark:bg-darkMode rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-[#99A1AF] hover:text-[#7E889A] cursor-pointer">×</button>

        {/* -------- Sign-Up -------- */}
        {step === "signup" && (
          <SignUpForm
            onSuccess={() => setStep("login")}
            onCancel={() => setStep("login")}
          />
        )}

        {/* -------- Login -------- */}
        {step === "login" && (
          <>
            <h2 className="mb-6 text-3xl font-bold text-center text-grayText dark:text-white">Welcome Back!</h2>
            <form onSubmit={handleLogin} className="login-form space-y-4">
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => { setStep("forgot-email"); setLoginMessage(""); }}
                  className="text-sm text-pinkDark hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div>
                <label>
                  Solve the captcha: {captchaQuestion}
                </label>
                <input
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  required
                />
              </div>

              <button className="mt-5 w-full py-2 font-bold text-white bg-wine rounded-lg hover:bg-wineDark cursor-pointer">
                Login
              </button>

              {loginMessage && (
                <p className={`mt-4 text-center ${loginMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {loginMessage}
                </p>
              )}

              <div className="text-center">
                <span className="text-grayText dark:text-white">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setStep("signup")}
                  className="font-bold text-pinkDark hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </>
        )}

        {/* -------- Forgot Email -------- */}
        {step === "forgot-email" && (
          <>
            <h2 className="mb-6 text-3xl font-bold text-center text-grayText dark:text-white">Reset Your Password</h2>
            <form className="login-form space-y-4" onSubmit={handleSendCode}>
              <label>Email</label>
              <input
                type="email"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="example@gmail.com"
              />
              <button
                type="submit"
                onClick={handleSendCode}
                className="mt-5 w-full py-2 font-bold text-white bg-wine rounded-lg hover:bg-wineDark cursor-pointer"
              >
                Send Verification Code
              </button>
              <button
                type="button"
                onClick={() => setStep("login")}
                className="block mx-auto text-sm text-grayText dark:text-white hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
              {fpMessage && (
                <p className="mt-2 text-center text-sm text-grayText dark:text-white">{fpMessage}</p>
              )}
            </form>
          </>
        )}

        {/* -------- Verify Code -------- */}
        {step === "forgot-verify" && (
          <>
            <h2 className="mb-6 text-3xl font-bold text-center text-grayText dark:text-white">Verify Code</h2>
            <form className="login-form space-y-4"
              onSubmit={handleVerify}>
              <label>Verification Code</label>
              <input
                value={fpUserCode}
                onChange={(e) => setFpUserCode(e.target.value)}
                placeholder="Enter 6-digit code (e.g. 123456)"
              />
              <button
                type="submit"
                className="mt-5 w-full py-2 font-bold text-white bg-wine rounded-lg hover:bg-wineDark cursor-pointer"
              >
                Verify
              </button>
              <button
                type="button"
                onClick={() => setStep("login")}
                className="block mx-auto text-sm text-grayText dark:text-white hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
              {fpMessage && (
                <p className="mt-2 text-center text-sm text-grayText dark:text-white">{fpMessage}</p>
              )}
            </form>
          </>
        )}

        {/* -------- Reset Password -------- */}
        {step === "forgot-reset" && (
          <>
            <h2 className="mb-6 text-3xl font-bold text-center text-grayText dark:text-white">Set New Password</h2>
            <form className="login-form space-y-4" onSubmit={handleSavePassword}>
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="submit"
                className="mt-5 w-full py-2 font-bold text-white bg-wine rounded-lg hover:bg-wineDark cursor-pointer"
              >
                Save New Password
              </button>
              {fpMessage && (
                <p className="mt-2 text-center text-sm text-grayText dark:text-white">{fpMessage}</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;