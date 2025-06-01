/**
 * Staff Schema model for MongoDB using Mongoose.
 * Defines the structure for staff member documents.
 */

import mongoose, { Document, Schema } from "mongoose";

// Define staff roles
export enum StaffRole {
  VETERINARIAN = "veterinarian",
  VETERINARY_ASSISTANT = "veterinary_assistant",
  RECEPTIONIST = "receptionist",
  CLINIC_DIRECTOR = "clinic_director"
}

export interface IStaff extends Document {
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
  imageUrl?: string; // Optional field for staff member's profile image
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: Object.values(StaffRole)
  },
  specialization: { type: String, required: false }, // Only required for veterinarians
  licenseNumber: { type: String, required: false, sparse: true }, // Unique but optional
  yearsOfExperience: { type: Number, required: true, min: 0 },
  description: { type: String, required: false, maxlength: 500 },
  availableSlots: [{ type: String }], // e.g., ["Monday 09:00-17:00", "Wednesday 14:00-18:00"]
  imageUrl: { type: String, required: false }, // URL to the staff member's profile image
  isActive: { type: Boolean, default: true },
}, {
  collection: "Staff", 
  versionKey: false,
  timestamps: true 
});

// Create indexes
StaffSchema.index({ role: 1 });
StaffSchema.index({ isActive: 1 });

export default mongoose.model<IStaff>("Staff", StaffSchema);
