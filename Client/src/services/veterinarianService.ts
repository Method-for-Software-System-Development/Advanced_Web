/**
 * Veterinarian service for API calls
 */

import { Veterinarian } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export const veterinarianService = {
  // Get all active veterinarians
  async getAllVeterinarians(): Promise<Veterinarian[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/vets`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      throw error;
    }
  },

  // Get all veterinarians including inactive ones
  async getAllVeterinariansIncludingInactive(): Promise<Veterinarian[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/vets?includeInactive=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all veterinarians:', error);
      throw error;
    }
  },

  // Get veterinarian by ID
  async getVeterinarianById(id: string): Promise<Veterinarian> {
    try {
      const response = await fetch(`${API_BASE_URL}/vets/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching veterinarian:', error);
      throw error;
    }
  },
  // Create a new veterinarian with optional image
  async createVeterinarian(vetData: Omit<Veterinarian, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>, image?: File): Promise<Veterinarian> {
    try {
      const formData = new FormData();
      
      // Add all veterinarian data to FormData
      Object.entries(vetData).forEach(([key, value]) => {
        if (key === 'availableSlots' && Array.isArray(value)) {
          value.forEach(slot => formData.append('availableSlots', slot));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add image if provided
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${API_BASE_URL}/vets`, {
        method: 'POST',
        body: formData, // Don't set Content-Type header, let browser set it for FormData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating veterinarian:', error);
      throw error;
    }
  },

  // Update veterinarian with optional image
  async updateVeterinarian(id: string, vetData: Partial<Veterinarian>, image?: File): Promise<Veterinarian> {
    try {
      const formData = new FormData();
      
      // Add all veterinarian data to FormData
      Object.entries(vetData).forEach(([key, value]) => {
        if (key === 'availableSlots' && Array.isArray(value)) {
          value.forEach(slot => formData.append('availableSlots', slot));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add image if provided
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${API_BASE_URL}/vets/${id}`, {
        method: 'PUT',
        body: formData, // Don't set Content-Type header, let browser set it for FormData
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating veterinarian:', error);
      throw error;
    }
  },
  // Deactivate veterinarian (soft delete)
  async deactivateVeterinarian(id: string): Promise<{ message: string; vet: Veterinarian }> {
    try {
      const response = await fetch(`${API_BASE_URL}/vets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deactivating veterinarian:', error);
      throw error;
    }
  },

  // Keep the old method name for backward compatibility
  async deleteVeterinarian(id: string): Promise<{ message: string; vet: Veterinarian }> {
    return this.deactivateVeterinarian(id);
  },

  // Reactivate veterinarian
  async activateVeterinarian(id: string): Promise<{ message: string; vet: Veterinarian }> {
    try {
      const response = await fetch(`${API_BASE_URL}/vets/${id}/activate`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error activating veterinarian:', error);
      throw error;
    }
  },
};
