import axios from "axios";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // IMPORTANT for cookies
});

API.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    if (!("Authorization" in config.headers)) {
      (config.headers as Record<string, string>)["Authorization"] =
        `Bearer ${authToken}`;
    }
  }
  return config;
});

export default API;