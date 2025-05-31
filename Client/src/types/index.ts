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
  ownerName: string;
  contact: string; // Existing contact (e.g., email)
  phone?: string; // New field for phone number
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
