import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
console.log("Axios base URL:", baseURL);

const axiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
    (config) => {
        // Try to get the token from localStorage
        try {
            const authData = localStorage.getItem("auth_data");
            if (authData) {
                const parsed = JSON.parse(authData);
                // Check if we got a token from the backend response
                if (parsed.token) {
                    config.headers.Authorization = `Bearer ${parsed.token}`;
                }
            }
        } catch (error) {
            console.error("Error accessing auth token for request:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;