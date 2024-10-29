import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const Navbar: React.FC = () => {
  const { user, logout, token, setUser, setToken } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const refreshToken = async () => {
      await api.post(
        "/auth/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    };
    const refresh = setInterval(refreshToken, 90000);
    if (token) {
      setIsLoggedIn(true); // User is logged in if a token exists
    }
    return () => clearInterval(refresh);
  }, [token]);
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      const decoded: any = jwtDecode(savedToken);
      console.log(decoded);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setToken("");
      } else {
        setUser({
          name: decoded.name,
          role: decoded.role,
          avatar_url: decoded.avatar_url,
          token: savedToken,
        });
        setToken(savedToken);
      }
    }
  }, []);
  useEffect(() => {
    setIsLoggedIn(user ? true : false);
  }, [user]);
  return (
    <nav className="bg-gray-800 p-4 flex w-full">
      <Link to="/" className="text-white mr-4">
        Home
      </Link>
      {!isLoggedIn && (
        <div className="flex-grow flex justify-end">
          <Link to="/login" className="text-white mr-4">
            Login
          </Link>
          {/* <Link to="/register" className="text-white">
            Register
          </Link> */}
        </div>
      )}
      {isLoggedIn && (
        <div className="flex flex-grow">
          <Link to="/admin" className="text-white ml-4 flex-grow">
            Dashboard
          </Link>
          <button onClick={logout} className="text-white ml-4">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
