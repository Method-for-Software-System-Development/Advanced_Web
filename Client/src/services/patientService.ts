import { Patient } from '../types';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

export const patientService = {
  /** Fetches all patients from the API */
  async getAllPatients(): Promise<Patient[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }     
      return await response.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  /** Creates a new patient with registration endpoint */
  async createPatient(patientData: Omit<Patient, '_id'>): Promise<Patient> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  /** Updates patient information with partial data */
  async updatePatient(id: string, patientData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    postalCode?: string;
  }): Promise<{ message: string; patient: Patient }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  /** Searches patients by name, email, or phone number */
    async searchPatients(query: string): Promise<Patient[]> {
      try {
        const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error searching patients:', error);
        throw error;
      }
    },
};
