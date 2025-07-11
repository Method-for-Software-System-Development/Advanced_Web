import { Prescription } from '../types';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

export const prescriptionService = {
  // Get all prescriptions
  async getAllPrescriptions(): Promise<Prescription[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  },

  // Get prescription by ID
  async getPrescriptionById(id: string): Promise<Prescription> {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching prescription:', error);
      throw error;
    }
  },

  // Create new prescription
  async createPrescription(prescriptionData: {
    issueDate: string;
    medicineType: string;
    medicineName: string;
    quantity: number;
    expirationDate: string;
    fulfilled?: boolean;
    referralType: string;
    appointmentId?: string; // Made optional
    petId: string;
    medicineId?: string;
  }): Promise<Prescription> {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  },
  // Update prescription
  async updatePrescription(id: string, updateData: {
    issueDate?: string;
    medicineType?: string;
    medicineName?: string;
    quantity?: number;
    expirationDate?: string;
    fulfilled?: boolean;
    referralType?: string;
    appointmentId?: string;
    petId?: string;
    medicineId?: string;
  }): Promise<Prescription> {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  },

  // Delete prescription
  async deletePrescription(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  },

  // Get prescriptions by pet IDs
  async getPrescriptionsByPetIds(petIds: string[]): Promise<Prescription[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/byPetIds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petIds }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching prescriptions by pet IDs:', error);
      throw error;
    }
  },

  // Get prescriptions by IDs
  async getPrescriptionsByIds(ids: string[]): Promise<Prescription[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/prescriptions/byIds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching prescriptions by IDs:', error);
      throw error;
    }
  }
};

export default prescriptionService;
