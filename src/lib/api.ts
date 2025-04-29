// Placeholder for API interaction logic (e.g., using Axios or Fetch)
// This file will contain functions to call backend endpoints for authentication,
// grocery management, etc.

// Base URL for the FastAPI backend (read from environment variable)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Default for local dev

// Custom Error class for API errors
class ApiError extends Error {
    status: number;
    data?: any; // Optional field to hold error data

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
        // Ensure the prototype chain is set correctly for extending built-in classes
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}


// Function to handle API requests, including setting JWT token if available
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null; // Get token only client-side

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = `${API_BASE_URL}${endpoint}`; // Construct full URL

  try {
    console.log(`Calling API: ${options.method || 'GET'} ${url}`); // Log API calls
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If response is not OK, parse error and throw custom error
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorData = null; // To store parsed error body

        try {
            // Attempt to parse JSON error response from FastAPI
            errorData = await response.json();
            // FastAPI often returns errors in {"detail": "error message"} format
            if (errorData && errorData.detail) {
                 // Handle cases where detail might be an array (validation errors)
                 if (Array.isArray(errorData.detail)) {
                    // Format validation errors like "field: message"
                    errorMessage = errorData.detail.map((err: any) => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ');
                 } else {
                    errorMessage = errorData.detail;
                 }
            } else if (errorData) {
                 // Fallback if parsing succeeds but no 'detail' field
                 errorMessage = JSON.stringify(errorData);
            }
        } catch (e) {
            // If parsing fails, use the status text or the default message
            errorMessage = response.statusText || errorMessage;
        }
        console.error('API Error:', response.status, errorMessage, errorData);
        // Throw custom ApiError with status and potentially parsed data
        throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle responses with no content (e.g., 204 No Content for DELETE)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        // console.log(`API Response OK: ${response.status} No Content`);
        return null; // Return null for no content responses
    }

    // Parse successful JSON response
    const data = await response.json();
    // console.log('API Response OK:', data); // Optional: Log successful response
    return data;

  } catch (error: any) {
    // Log the error, whether it's an ApiError or a network/fetch error
    console.error(`Fetch API Error (${options.method || 'GET'} ${url}):`, error);

    // Re-throw the error to be caught by the caller
    // If it's not already an Error object (e.g., network error), wrap it
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(String(error));
    }
  }
}


// API functions mapping to backend endpoints
export const api = {
  // Auth
  login: async (data: any) => {
    // FastAPI expects form data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', data.email); // FastAPI uses 'username' field for email
    formData.append('password', data.password);

    // Need to override Content-Type for form data
    return fetchApi('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    });
  },
  register: async (data: any) => fetchApi('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  testToken: async () => fetchApi('/api/v1/auth/test-token'), // For testing auth setup

  // User
  getCurrentUser: async () => fetchApi('/api/v1/users/me'),
  updateUser: async (data: any) => fetchApi('/api/v1/users/me', { method: 'PUT', body: JSON.stringify(data)}), // Limited use currently
  changePassword: async (data: any) => fetchApi('/api/v1/users/me/password', { method: 'PUT', body: JSON.stringify(data)}),
  deleteAccount: async () => fetchApi('/api/v1/users/me', { method: 'DELETE' }),

  // Groceries
  getGroceries: async () => fetchApi('/api/v1/groceries/'),
  addGrocery: async (data: any) => fetchApi('/api/v1/groceries/', { method: 'POST', body: JSON.stringify(data) }),
  updateGrocery: async (id: number, data: any) => fetchApi(`/api/v1/groceries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGrocery: async (id: number) => fetchApi(`/api/v1/groceries/${id}`, { method: 'DELETE' }),
};
