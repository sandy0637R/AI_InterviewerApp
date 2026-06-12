import apiClient, { setupInterceptors } from "./axios";

// Re-export everything from the new axios instance to maintain backward compatibility
// where possible, but redirecting logic to the new robust instance.

export const API_BASE = "/interview";
export const SESSION_BASE = "/sessions";
export const AUTH_BASE = "/auth";


export { setupInterceptors };
export default apiClient;
