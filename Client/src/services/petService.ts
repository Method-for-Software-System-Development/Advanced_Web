import { Pet } from '../types';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

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
  // Update an existing pet
  async updatePet(petId: string, petData: Omit<Pet, '_id' | 'prescriptions' | 'treatments'>): Promise<Pet> {
    try {
      const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating pet:', error);
      throw error;
    }
  },

  // Upload pet image
  async uploadPetImage(petId: string, imageFile: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('petId', petId);

      const response = await fetch(`${API_BASE_URL}/pets/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading pet image:', error);
      throw error;
    }
  },
};