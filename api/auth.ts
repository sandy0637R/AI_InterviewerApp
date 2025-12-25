import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { InternalAxiosRequestConfig } from "axios";
import { store } from "../redux/store";

const AUTH_BASE = "http://192.168.0.100:5000/auth";

// ----------------------------
// Axios interceptor
// ----------------------------
axios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = store.getState().auth.token;

    if (!token) {
      token = await AsyncStorage.getItem("token");
    }

    if (token) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders(); // ✅ TS fix
      }
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// API functions
// ----------------------------
export const loginApi = (payload: { email: string; password: string }) =>
  axios.post(`${AUTH_BASE}/login`, payload);

export const registerApi = (payload: { name: string; email: string; password: string }) =>
  axios.post(`${AUTH_BASE}/register`, payload, { timeout: 5000 });

// ✅ interceptor attaches token automatically
export const profileApi = (): Promise<{ data: { user: any } }> =>
  axios.get(`${AUTH_BASE}/profile`, { timeout: 5000 });
