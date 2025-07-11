/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get the API base URL from environment variables
// In development: http://localhost:3000
// In production: your deployed backend URL
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Remove trailing slash if present to avoid double slashes
export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

// Full API URL with /api suffix
export const API_URL = `${API_BASE_URL}/api`;

// For backwards compatibility, export as default
export default API_URL;
