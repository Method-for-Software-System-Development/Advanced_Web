/**
 * Appointment Service - API calls for managing appointments
 */
import { Appointment, AppointmentStatus, AppointmentType } from '../types';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

export const appointmentService = {
  // Get all appointments with optional filtering
  async getAllAppointments(filters?: {
    date?: string;
    staffId?: string;
    userId?: string;
    petId?: string;
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const url = `${API_BASE_URL}/appointments${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get appointments for a specific date
  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    try {
      const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      return await this.getAllAppointments({ date: dateString });
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      throw error;
    }
  },

  // Get appointments in a date range
  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    try {
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      return await this.getAllAppointments({ 
        startDate: startDateString, 
        endDate: endDateString 
      });
    } catch (error) {
      console.error('Error fetching appointments by date range:', error);
      throw error;
    }
  },

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  // Create new appointment
  async createAppointment(appointmentData: {
    userId: string;
    petId: string;
    staffId: string;
    date: string; // ISO date string
    time: string;
    duration?: number;
    type: AppointmentType;
    description: string;
    notes?: string;
    cost?: number;
  }): Promise<{ message: string; appointment: Appointment }> {
    try {
      console.log('appointmentService.createAppointment called with:', appointmentData);
      
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      console.log('HTTP Response status:', response.status);
      console.log('HTTP Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('HTTP Error Response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('HTTP Success Response:', result);
      return result;
    } catch (error) {
      console.error('Error in appointmentService.createAppointment:', error);
      throw error;
    }
  },

  // Update appointment
  async updateAppointment(id: string, updateData: {
    date?: string;
    time?: string;
    duration?: number;
    type?: AppointmentType;
    status?: AppointmentStatus;
    description?: string;
    notes?: string;
    cost?: number;
  }): Promise<{ message: string; appointment: Appointment }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Cancel appointment
  async cancelAppointment(id: string): Promise<{ message: string; appointment: Appointment }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

  // Update appointment status
  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<{ message: string; appointment: Appointment }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Get appointments by staff member
  async getAppointmentsByStaff(staffId: string, date?: string): Promise<Appointment[]> {
    try {
      const filters: any = { staffId };
      if (date) filters.date = date;
      
      return await this.getAllAppointments(filters);
    } catch (error) {
      console.error('Error fetching appointments by staff:', error);
      throw error;
    }
  },

  // Get appointments by user
  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    try {
      return await this.getAllAppointments({ userId });
    } catch (error) {
      console.error('Error fetching appointments by user:', error);
      throw error;
    }
  },

  // Get appointments by pet
  async getAppointmentsByPet(petId: string): Promise<Appointment[]> {
    try {
      return await this.getAllAppointments({ petId });
    } catch (error) {
      console.error('Error fetching appointments by pet:', error);
      throw error;
    }
  }
};

export default appointmentService;
