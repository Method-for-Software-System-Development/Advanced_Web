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
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
};

export default userService;
