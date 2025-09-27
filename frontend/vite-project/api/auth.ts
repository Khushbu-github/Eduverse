import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // FastAPI backend
});

// Register (student only in frontend)
export const registerUser = async (userData) => {
  return API.post("auth/register", userData);
};

// Login (student, teacher, hod)
export const loginUser = async (credentials) => {
  return API.post("auth/login", credentials);
};

// Get current user
export const getMe = async (token) => {
  return API.get("auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
};
