export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
}

export interface Patient {
  id: string;
  ownerName: string;
  contact: string; // Existing contact (e.g., email)
  phone?: string; // New field for phone number
  pets: Pet[];
}
