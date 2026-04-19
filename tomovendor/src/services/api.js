// src/services/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API || "https://tb-dddy.onrender.com";

const API = axios.create({
  baseURL: `${API_BASE}/api`,
});

export const registerVendor = (formData) =>
  API.post("/vendors/register", formData);
