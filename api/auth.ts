import { AUTH_BASE } from "./client";
import apiClient from "./client";

// ----------------------------
// API functions
// ----------------------------
export const loginApi = (payload: { email: string; password: string }) =>
  apiClient.post(`${AUTH_BASE}/login`, payload);

export const registerApi = (payload: { name: string; email: string; password: string }) =>
  apiClient.post(`${AUTH_BASE}/register`, payload);

// Interceptors in apiClient handle token
export const profileApi = (): Promise<{ data: { user: any } }> =>
  apiClient.get(`${AUTH_BASE}/profile`);
