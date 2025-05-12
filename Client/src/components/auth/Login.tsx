import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha(`${num1 + num2}`);
    setCaptchaQuestion(`${num1} + ${num2}`);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (captchaAnswer !== captcha) {
      setLoginMessage("Incorrect captcha answer.");
      generateCaptcha();
      return;
    }

    if (usernameOrEmail === "test" && password === "password") {
      setLoginMessage("Login successful!");
    } else {
      setLoginMessage("Invalid username/email or password.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="w-full max-w-lg p-10 bg-white rounded-lg shadow-lg">
        <h2 className="text-4xl font-bold text-center mb-6 text-[#4A3F35]">Welcome Back!</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="usernameOrEmail" className="block text-[#4A3F35] text-lg mb-2">Username or Email</label>
            <input
              type="text"
              id="usernameOrEmail"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none text-[#4A3F35]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[#4A3F35] text-lg mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none text-[#4A3F35]"
              required
            />
          </div>

          {/* Forget Password Link */}
          <div className="text-right mb-4">
            <Link to="/forgot-password" className="text-blue-500 hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>

          <div>
            <label className="block text-[#4A3F35] text-lg mb-2">Solve the Captcha: {captchaQuestion}</label>
            <input
              type="text"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none text-[#4A3F35]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 text-lg"
          >
            Login
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-blue-500 hover:underline font-semibold">
              Sign Up
            </Link>
          </div>

          {loginMessage && (
            <p className={`text-center mt-4 text-lg font-medium ${loginMessage.includes("success") ? "text-green-500" : "text-red-500"}`}>{loginMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;