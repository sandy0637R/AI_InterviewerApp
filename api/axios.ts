import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper to get local IP
const getBaseUrl = () => {
    // 1. Production Mode (Standalone APK/AAB)
    if (!__DEV__) {
        return `https://ai-interviewer-backend-jxjz.onrender.com`;
    }

    // 2. Development Mode (USB/Simulator)
    const hostUri = Constants.expoConfig?.hostUri;
    let host = "192.168.0.103"; // Fallback static IP
    if (hostUri) {
        host = hostUri.split(":")[0];
    }

    // Default to port 5000 for backend
    return `http://${host}:5000`;
};

const BASE_URL = getBaseUrl();
console.log("API Base URL:", BASE_URL);

// Create single axios instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // 15 seconds global timeout
    headers: {
        "Content-Type": "application/json",
    },
});

// Setup interceptors to inject token
export const setupInterceptors = (store: any) => {
    apiClient.interceptors.request.use(
        async (config) => {
            // 1. Try Redux state first (fastest)
            let token = store.getState().auth.token;

            // 2. Fallback to AsyncStorage if Redux is empty (e.g., after reload)
            if (!token) {
                token = await AsyncStorage.getItem("token");
            }

            // 3. Attach token
            if (token) {
                if (config.headers) {
                    // Use set if available (newer axios), otherwise direct assignment
                    if (typeof (config.headers as any).set === 'function') {
                        (config.headers as any).set("Authorization", `Bearer ${token}`);
                    } else {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor for global error handling (optional, but good for debugging)
    apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    console.error("Request timed out");
                } else if (error.message === 'Network Error') {
                    console.error("Network Error - check backend URL or Wifi");
                }
            }
            return Promise.reject(error);
        }
    );
};

export default apiClient;
