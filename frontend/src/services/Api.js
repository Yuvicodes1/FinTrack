import axios from "axios";
import { auth } from "../firebase";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// ── Attach Firebase ID token to every request automatically ─────────────────
API.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      // getIdToken(true) forces a refresh if the token is expired
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;