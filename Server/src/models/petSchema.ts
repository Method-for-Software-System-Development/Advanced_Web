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
  prescriptions: mongoose.Types.ObjectId[]; // Or a custom type if you embed
  treatments: mongoose.Types.ObjectId[];    // Or a custom type if you embed
}

const petSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: { type: String, required: true },
  birthYear: { type: Number, required: true },
  weight: { type: Number, required: true },
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription", default: [] }],
  treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Treatment", default: [] }],
});

export default mongoose.model<IPet>("Pet", petSchema, "Pets");
