import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import LoginWithCoinbase from "../components/LoginWithCoinbase";

const Login: React.FC = () => {
  // const { login } = useAuth();
  // const navigate = useNavigate();
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/"; // Redirect to the dashboard or home
    }
  }, []);
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">Login</h1>
      {/* <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 mb-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Login
        </button>
      </form> */}
      <LoginWithCoinbase />
    </div>
  );
};

export default Login;
