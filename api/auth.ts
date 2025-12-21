import axios from "axios";

const AUTH_BASE = "http://192.168.0.102:5000/auth"; // Android emulator

export const loginApi = (payload: { email: string; password: string }) =>
  axios.post(`${AUTH_BASE}/login`, payload);

export const registerApi = (payload: { name: string; email: string; password: string }) =>
  axios.post(`${AUTH_BASE}/register`, payload, { timeout: 5000 });

export const profileApi = (token: string) =>
  axios.get(`${AUTH_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
