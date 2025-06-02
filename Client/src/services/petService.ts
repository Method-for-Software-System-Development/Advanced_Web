import { Pet } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

export const petService = {
  // Get all pets for a specific patient
  async getPetsByPatientId(patientId: string): Promise<Pet[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/pets`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pets:', error);
      throw error;
    }
  },

  // Add a new pet for a specific patient
  async addPetForPatient(patientId: string, petData: Omit<Pet, '_id'>): Promise<Pet> {
    try {
      const dataToSend = { ...petData, owner: patientId };
      const response = await fetch(`${API_BASE_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding pet:', error);
      throw error;
    }
  },
};