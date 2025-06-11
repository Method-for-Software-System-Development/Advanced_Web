/**
 * Medicine Service - API calls for managing medicines
 */
import { Medicine } from '../types';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

export const medicineService = {
  // Get all medicines with optional search
  async getAllMedicines(search?: string): Promise<Medicine[]> {
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      
      const url = `${API_BASE_URL}/medicines${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error;
    }
  },

  // Search medicines (alias for getAllMedicines with search)
  async searchMedicines(searchTerm: string): Promise<Medicine[]> {
    return this.getAllMedicines(searchTerm);
  },

  // Get medicine by ID
  async getMedicineById(id: string): Promise<Medicine> {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching medicine:', error);
      throw error;
    }
  },
};

export default medicineService;
