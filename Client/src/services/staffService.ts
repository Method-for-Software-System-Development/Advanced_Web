/**
 * Staff Service - API calls for managing staff members
 */
import { Staff } from '../types';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

export const staffService = {
  // Get all active staff members
  async getAllStaff(): Promise<Staff[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/staff`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },
  // Get all staff members including inactive ones
  async getAllStaffIncludingInactive(): Promise<Staff[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/staff?includeInactive=true`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all staff:', error);
      throw error;
    }  },

  // Get staff member by ID
  async getStaffById(id: string): Promise<Staff> {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching staff member:', error);
      throw error;
    }
  },

  // Create new staff member
  async createStaff(staffData: Omit<Staff, '_id' | 'createdAt' | 'updatedAt'>, imageFile?: File): Promise<{ message: string; staff: Staff }> {
    try {
      const formData = new FormData();
      
      // Add all staff data to FormData
      Object.entries(staffData).forEach(([key, value]) => {
        if (key === 'availableSlots' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/staff`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating staff member:', error);
      throw error;
    }
  },

  // Update staff member
  async updateStaff(id: string, staffData: Partial<Staff>, imageFile?: File): Promise<{ message: string; staff: Staff }> {
    try {
      const formData = new FormData();
      
      // Add all staff data to FormData
      Object.entries(staffData).forEach(([key, value]) => {
        if (key === 'availableSlots' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
          formData.append(key, value.toString());
        }
      });

      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating staff member:', error);
      throw error;
    }
  },

  // Deactivate staff member (soft delete)
  async deactivateStaff(id: string): Promise<{ message: string; staff: Staff }> {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deactivating staff member:', error);
      throw error;
    }
  },
  // Reactivate staff member
  async activateStaff(id: string): Promise<{ message: string; staff: Staff }> {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${id}/activate`, {
        method: 'PUT',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error activating staff member:', error);
      throw error;
    }
  },

  // Keep the old method names for backward compatibility
  async deleteStaff(id: string): Promise<{ message: string; staff: Staff }> {
    return this.deactivateStaff(id);
  },
};

export default staffService;
