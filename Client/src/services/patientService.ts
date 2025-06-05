import { Patient } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export const patientService = {
  // Get all patients
  async getAllPatients(): Promise<Patient[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      console.log(response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }     
      return await response.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Create a new patient
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

  // Update patient
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

  // Search patients by name or email
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
