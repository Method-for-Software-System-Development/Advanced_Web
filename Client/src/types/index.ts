export interface Pet {
  _id: string;
  name: string;
  type: string;
  breed: string;
  birthYear: number;
  weight: number;
  prescriptions: string[]; 
  treatments: string[];
}

export interface Prescription {
  _id: string;
  issueDate: string;
  medicineType: string;
  quantity: number;
  expirationDate: string;
  fulfilled: boolean;
  referralType: string;
  cost: number;
  appointmentId: string; 
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  postalCode?: string; // Optional field for postal code
  pets: Pet[];
}


export enum StaffRole {
  VETERINARIAN = "veterinarian",
  VETERINARY_ASSISTANT = "veterinary_assistant",
  RECEPTIONIST = "receptionist",
  CLINIC_DIRECTOR = "clinic_director"
}

export interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  specialization?: string; // Optional, mainly for veterinarians
  licenseNumber?: string; // Optional, mainly for veterinarians
  yearsOfExperience: number;
  description: string;
  availableSlots: string[];
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed", 
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show"
}

export enum AppointmentType {
  WELLNESS_EXAM = "wellness_exam",
  VACCINATION = "vaccination",
  SPAY_NEUTER = "spay_neuter",
  DENTAL_CLEANING = "dental_cleaning",
  EMERGENCY_CARE = "emergency_care",
  SURGERY = "surgery",
  DIAGNOSTIC_IMAGING = "diagnostic_imaging",
  BLOOD_WORK = "blood_work",
  FOLLOW_UP = "follow_up",
  GROOMING = "grooming",
  BEHAVIORAL_CONSULTATION = "behavioral_consultation",
  MICROCHIPPING = "microchipping"
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pets: Pet[]; // Added pets property
}

export interface Appointment {
  _id: string;
  userId: User | string; // Can be populated or just ID
  petId: Pet | string; // Can be populated or just ID  
  staffId: Staff | string; // Can be populated or just ID
  date: string; // ISO date string
  time: string; // Format: "10:30 AM"
  duration: number; // Duration in minutes
  type: AppointmentType;
  status: AppointmentStatus;
  description: string;
  notes?: string;
  cost?: number;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  _id: string;
  visitDate: string;
  visitTime: string;
  vetId: string;
  treatmentType: string;
  cost: number;
  visitationType: string;
  visitationCategory: string;
  notes: string;
  petId: string;
}
