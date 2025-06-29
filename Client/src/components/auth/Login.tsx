import React, { useState, useEffect, } from "react";
import SignUpForm from "./SignUpForm";
import FirstTimePasswordChangeModal from "./FirstTimePasswordChangeModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../config/api';
import { User } from '../../types';

interface LoginProps {
  onClose: () => void;
}

type Step = "login" | "signup" | "forgot-email" | "forgot-verify" | "forgot-reset" | "first-time-password-change";

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
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ─────────── Forgot-password state ─────────── */
  const [fpEmail, setFpEmail] = useState("");
  const [fpUserCode, setFpUserCode] = useState("");
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
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

  // Handle individual digit input changes
  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);

    // Update the combined code
    setFpUserCode(newDigits.join(""));

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle backspace to move to previous input
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle paste for verification code
  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d{1,6}$/.test(pastedData)) return;

    const newDigits = [...codeDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setCodeDigits(newDigits);
    setFpUserCode(newDigits.join(""));

    // Focus the next empty input or the last input
    const nextEmptyIndex = newDigits.findIndex(digit => digit === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    const targetInput = document.getElementById(`digit-${focusIndex}`);
    targetInput?.focus();
  };

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
      }); setLoginMessage("Login successful!");
      const user = response.data.user;
      
      sessionStorage.setItem("client", JSON.stringify(user));
      //  to save the JWT token you got from the server
      sessionStorage.setItem("token", response.data.token);
      // Save the user's role for navbar/dashboard logic
      sessionStorage.setItem("role", user.role || "user");

      // Check if this is the user's first login
      if (user.isFirstLogin === true) {
        setLoggedInUser(user);
        setStep("first-time-password-change");
        return; // Don't close modal or redirect yet
      }

      setTimeout(() => {
        onClose();
        // Redirect based on user role
        const userRole = user.role;
        if (userRole === "secretary") {
          navigate("/secretary");
        } else {
          navigate("/client");
        }
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
    e.preventDefault(); try {
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

    setFpMessage("Saving new password..."); try {
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

  /* ─────────── First time password change handler ─────────── */
  const handlePasswordChanged = (updatedUser: User) => {
    // Update the user in session storage
    sessionStorage.setItem("client", JSON.stringify(updatedUser));
    
    // Close the modal and redirect to appropriate page
    setTimeout(() => {
      onClose();
      const userRole = updatedUser.role;
      if (userRole === "secretary") {
        navigate("/secretary");
      } else {
        navigate("/client");
      }
    }, 500);
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      {step !== "first-time-password-change" && (
        <div className="relative w-full max-w-xs sm:max-w-lg p-3 sm:p-8 bg-white dark:bg-darkMode rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
          <button onClick={onClose} className="absolute top-2 right-2 sm:top-4 sm:right-4 text-xl sm:text-2xl text-[#99A1AF] hover:text-[#7E889A] cursor-pointer">×</button>

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
            <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-center text-grayText dark:text-white">Welcome Back!</h2>
            <form onSubmit={handleLogin} className="login-form space-y-3 sm:space-y-4">
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
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
                  >
                    {showLoginPassword ? (
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

              <button className="mt-4 sm:mt-5 w-full py-2 font-bold text-white bg-wine rounded-lg hover:bg-wineDark cursor-pointer text-sm sm:text-base">
                Login
              </button>

              {loginMessage && (
                <p className={`mt-3 sm:mt-4 text-center text-sm ${loginMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {loginMessage}
                </p>
              )}
              <div className="text-center mt-3 sm:mt-4">
                <span className="text-grayText dark:text-white text-xs sm:text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="#contact" onClick={onClose} className="font-bold text-pinkDark hover:underline cursor-pointer">
                    Contact us
                  </a>{" "}
                  to create an account and book a free introductory meeting or your first appointment.
                </span>
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
            <form className="login-form space-y-4" onSubmit={handleVerify}>
              <div>
                <label className="block text-center mb-4 text-grayText dark:text-white">
                  Enter the 6-digit verification code sent to your email
                </label>
                <div className="flex justify-center space-x-2 mb-4">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`digit-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      onPaste={index === 0 ? handleCodePaste : undefined}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg 
                                focus:border-wine focus:ring-2 focus:ring-wine/20 focus:outline-none
                                bg-white dark:bg-gray-700 text-grayText dark:text-white
                                transition-all duration-200"
                      maxLength={1}
                      autoComplete="off"
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
                  You can also paste the entire code in the first box
                </p>
              </div>
              <button
                type="submit"
                disabled={codeDigits.join("").length !== 6}
                className={`mt-5 w-full py-2 font-bold text-white rounded-lg cursor-pointer transition-colors
                  ${codeDigits.join("").length === 6 
                    ? "bg-wine hover:bg-wineDark" 
                    : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                Verify
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setCodeDigits(["", "", "", "", "", ""]);
                  setFpUserCode("");
                }}
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
              <div>
                <label>New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
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
              <div>
                <label>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
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
      )}

      {/* First Time Password Change Modal */}
      {step === "first-time-password-change" && loggedInUser && (
        <FirstTimePasswordChangeModal
          user={loggedInUser}
          onPasswordChanged={handlePasswordChanged}
          onClose={() => setStep("login")} // Allow going back to login if needed
        />
      )}
    </div>
  );
};

export default Login;