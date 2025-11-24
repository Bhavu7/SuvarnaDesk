import axios from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            toast.error("Session expired. Please login again.");
        }
        return Promise.reject(error);
    }
);

export default apiClient;