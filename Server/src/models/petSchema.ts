/**
 * Pet Schema management for MongoDB using Mongoose.
 * Defines the structure for pet documents.
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IPet extends Document {
  name: string;
  type: string;
  breed: string;
  birthYear: number;
  weight: number;
  isActive: boolean;
  prescriptions: mongoose.Types.ObjectId[]; // Or a custom type if you embed
  treatments: mongoose.Types.ObjectId[];    // Or a custom type if you embed
  imageUrl: string; // URL or path to the pet's image
  sex: "Male" | "Female"; // Added sex field
}

const petSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: { type: String, required: true },
  birthYear: { type: Number, required: true },
  weight: { type: Number, required: true },
  isActive: { type: Boolean, required: true, default: true },
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription", default: [] }],
  treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Treatment", default: [] }],
  imageUrl: { type: String, required: true, default: "/images/default-pet.png" }, // Default neutral image
  sex: { type: String, enum: ["Male", "Female"], required: true }, // Added sex field
});

export default mongoose.model<IPet>("Pet", petSchema, "Pets");
