import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: apiBaseURL,
});

const attachAuth = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachAuth);
axios.interceptors.request.use(attachAuth);

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("uniborrow_user");
      // Keep it simple for MVP: route guard will redirect.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

