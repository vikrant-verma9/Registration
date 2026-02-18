import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // attach to Authorization header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
  