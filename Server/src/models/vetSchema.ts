/**
 * Veterinarian Schema model for MongoDB using Mongoose.
 * Defines the structure for veterinarian documents.
 */

import mongoose, { Document, Schema } from "mongoose";

export interface IVet extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  description: string;
  availableSlots: string[];
  imageUrl?: string; // Optional field for veterinarian's profile image
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VetSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, unique: true, required: true },
  yearsOfExperience: { type: Number, required: true, min: 0 },
  description: { type: String, required: false, maxlength: 500 },
  availableSlots: [{ type: String }], // e.g., ["Monday 09:00-17:00", "Wednesday 14:00-18:00"]
  imageUrl: { type: String, required: false }, // URL to the veterinarian's profile image
  isActive: { type: Boolean, default: true },
}, {
  collection: "Veterinarians", 
  versionKey: false,
  timestamps: true 
});

export default mongoose.model<IVet>("Vet", VetSchema);
