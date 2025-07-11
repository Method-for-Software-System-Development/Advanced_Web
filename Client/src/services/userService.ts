/**
 * User Service - API calls for managing user profile
 */
import { User } from '../types/index';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

export const userService = {
  // Update user profile (email, phone, city, street, and postal code)
  async updateUser(id: string, userData: {
    email?: string;
    phone?: string;
    city?: string;
    street?: string;
    postalCode?: string;
  }): Promise<{ message: string; user: User }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Change user password
  async changePassword(id: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            // If not JSON, get text content
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } catch (parseError) {
          // If parsing fails, use default error message
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
};

export default userService;
