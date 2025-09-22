// Axios instance used across the app to hit the backend API.
// The base URL is injected at build time via Vite's env variable.
import axios from "axios";

const backendApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export default backendApi;
