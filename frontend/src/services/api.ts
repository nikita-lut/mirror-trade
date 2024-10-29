// frontend/src/services/api.ts

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"; // Update with your backend API URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login User
export const loginUser = async (credentials: {
  username: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", credentials);
  return response.data.token; // Assuming the backend returns a token
};

// Login with Coinbase
export const loginWithCb = async (params: string) => {
  const response = await api.get(`/auth/coinbase/callback${params}`);
  return response.data.token;
};
// Register User
export const registerUser = async (userData: {
  username: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", userData);
  return response.data; // Adjust based on your API response
};

// Fetch User Profile
export const fetchUserProfile = async (token: string) => {
  const response = await api.get("/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // Return user profile data
};

// Set Mirrored USDC
export const setMirroredUSDC = async (token: string, amount: number) => {
  await api.post(
    "/user/mirror",
    { amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Fetch Users (Admin Functionality)
export const fetchUsers = async (token: string) => {
  const response = await api.get("/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // Return list of users
};

// Update Main Account Settings
export const updateMainAccountSettings = async (
  token: string,
  settings: { usdc: number; allocations: Record<string, number> }
) => {
  await api.put("/admin/settings", settings, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get Users
export const getUsers = async () => {
  const response = await api.get("/users"); // Adjust endpoint as needed
  return response.data; // Assuming it returns an array of users
};

// Update Fund Allocations
export const updateFundAllocations = async (allocations: object) => {
  const response = await api.post("/admin/update-allocations", allocations); // Adjust endpoint as needed
  return response.data;
};

// Additional functions as needed for your project

export default api;
