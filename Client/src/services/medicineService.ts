/**
 * Medicine Service - API calls for managing medicines
 */
import { Medicine } from '../types';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

export const medicineService = {
  /** Fetches all medicines with optional search filtering */
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

  /** Searches medicines by term - alias for getAllMedicines with search */
  async searchMedicines(searchTerm: string): Promise<Medicine[]> {
    return this.getAllMedicines(searchTerm);
  },
};

export default medicineService;
