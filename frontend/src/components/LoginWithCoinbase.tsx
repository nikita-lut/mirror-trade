import React from "react";

const API_URL = "http://localhost:5000/api"; // Update with your backend API URL

const LoginWithCoinbase: React.FC = () => {
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/coinbase/login`;
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 text-white py-2 px-4 rounded"
    >
      Login with Coinbase
    </button>
  );
};

export default LoginWithCoinbase;
