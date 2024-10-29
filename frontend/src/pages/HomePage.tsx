import React, { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

const Home: React.FC = () => {
  const { loginWithCoinbase, user } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const loginWithCB = useCallback(async (params: string) => {
    const success = await loginWithCoinbase(params).catch(console.log);
    if (success) {
      navigate("/");
    }
  }, []);
  const init = useRef(true);
  useEffect(() => {
    if (user && user.token) {
      navigate("");
    }
  }, [user]);
  useEffect(() => {
    if (init.current) {
      init.current = false;
      return; // Skip the first effect run
    }

    if (loc.search) {
      loginWithCB(loc.search);
    }
    return () => {};
  }, [loc, loginWithCB]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">
        Welcome to the Coinbase Account Mirroring System
      </h1>
      <p>This is your home page.</p>
    </div>
  );
};

export default Home;
