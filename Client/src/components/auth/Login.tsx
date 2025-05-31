import React, { useState, useEffect ,} from "react";
import SignUpForm from "./SignUpForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const [verificationCode] = useState("123456");      // demo code
  const [fpUserCode, setFpUserCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fpMessage, setFpMessage] = useState("");

  /* ─────────── utils ─────────── */
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptcha(`${a + b}`);
    setCaptchaQuestion(`${a} + ${b}`);
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

    try {
      /**
       * Send a POST request to the login endpoint.
       * The API should return { message, user } on success,
       * or { error } on failure.
       */
      const response = await axios.post("http://localhost:3000/api/users/login", {
        email,
        password,
      });

      setLoginMessage("Login successful!");
      localStorage.setItem("client", JSON.stringify(response.data.user));
      //  to save the JWT token you got from the server
      localStorage.setItem("token", response.data.token);
      // Save the user's role for navbar/dashboard logic
      localStorage.setItem("role", response.data.user.role || "user");

      setTimeout(() =>{
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

  const handleSendCode = () => {
    if (!fpEmail.includes("@")) {
      setFpMessage("Please enter a valid email.");
      return;
    }
    setFpMessage(`Verification code sent to ${fpEmail}`);
    setStep("forgot-verify");
  };

  const handleVerify = () => {
    if (fpUserCode === verificationCode) {
      setFpMessage("Code verified. Choose new password.");
      setStep("forgot-reset");
    } else {
      setFpMessage("Wrong code, try again.");
    }
  };

  const handleSavePassword = () => {
    if (newPassword.length < 6) return setFpMessage("Password must be at least 6 chars.");
    if (newPassword !== confirmPassword) return setFpMessage("Passwords don't match.");
    setFpMessage("Password changed! You can now sign-in.");
    setTimeout(() => {
      setStep("login");
      setFpMessage("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-8 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-[#3B3B3B] hover:text-black cursor-pointer">×</button>

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
            <h2 className="mb-6 text-2xl font-bold text-center text-[#3B3B3B]">Welcome Back!</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm text-[#3B3B3B]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-[#3B3B3B] border border-[#3B3B3B] rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-lg text-[#4A3F35]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>

              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => { setStep("forgot-email"); setLoginMessage(""); }}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div>
                <label className="block mb-2 text-lg text-[#4A3F35]">
                  Solve the captcha: {captchaQuestion}
                </label>
                <input
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>

              <button className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Login
              </button>

              {loginMessage && (
                <p className={`mt-4 text-center ${loginMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {loginMessage}
                </p>
              )}

              <div className="mt-6 text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setStep("signup")}
                  className="font-semibold text-blue-500 hover:underline"
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
            <h2 className="mb-6 text-2xl font-bold text-center text-[#4A3F35]">Reset Your Password</h2>
            <label className="block mb-2 text-[#4A3F35]">Email Address</label>
            <input
              type="email"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleSendCode}
              className="w-full py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Send Verification Code
            </button>
            <button
              onClick={() => setStep("login")}
              className="w-full mt-2 text-sm text-gray-500 hover:underline"
            >
              Back to Sign In
            </button>
            {fpMessage && (
              <p className="mt-4 text-center text-sm text-gray-700">{fpMessage}</p>
            )}
          </>
        )}

        {/* -------- Verify Code -------- */}
        {step === "forgot-verify" && (
          <>
            <h2 className="mb-6 text-2xl font-bold text-center text-[#4A3F35]">Verify Code</h2>
            <label className="block mb-2 text-[#4A3F35]">Verification Code</label>
            <input
              value={fpUserCode}
              onChange={(e) => setFpUserCode(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="123456"
            />
            <button
              onClick={handleVerify}
              className="w-full py-2 mt-4 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Verify
            </button>
            <button
              onClick={() => setStep("login")}
              className="w-full mt-2 text-sm text-gray-500 hover:underline"
            >
              Back to Sign In
            </button>
            {fpMessage && (
              <p className="mt-4 text-center text-sm text-gray-700">{fpMessage}</p>
            )}
          </>
        )}

        {/* -------- Reset Password -------- */}
        {step === "forgot-reset" && (
          <>
            <h2 className="mb-6 text-2xl font-bold text-center text-[#4A3F35]">Set New Password</h2>
            <label className="block mb-2 text-[#4A3F35]">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <label className="block mt-4 mb-2 text-[#4A3F35]">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleSavePassword}
              className="w-full py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save New Password
            </button>
            {fpMessage && (
              <p className="mt-4 text-center text-sm text-gray-700">{fpMessage}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
