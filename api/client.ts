import apiClient, { setupInterceptors } from "./axios";

// Re-export everything from the new axios instance to maintain backward compatibility
// where possible, but redirecting logic to the new robust instance.

export const API_BASE = apiClient.defaults.baseURL + "/interview";
export const SESSION_BASE = apiClient.defaults.baseURL + "/sessions";
export const AUTH_BASE = apiClient.defaults.baseURL + "/auth";

export { setupInterceptors };
export default apiClient;
