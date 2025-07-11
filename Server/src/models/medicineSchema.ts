/**
 * Medicine Schema model for MongoDB using Mongoose.
 * Defines the structure for medicine documents.
 */

import mongoose, { Document, Schema } from "mongoose";

export interface IMedicine extends Document {
  _id: mongoose.Types.ObjectId;
  Type: string;
  Referral: string;
  Name: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema: Schema = new Schema({
  Type: { type: String, required: true },
  Referral: { type: String, required: true },
  Name: { type: String, required: true, unique: true }
}, {
  collection: "Medicine",
  versionKey: false,
  timestamps: true
});

// Create indexes for efficient searching
// Note: Name already has an index due to unique: true
MedicineSchema.index({ Type: 1 });
MedicineSchema.index({ Referral: 1 });

export default mongoose.model<IMedicine>("Medicine", MedicineSchema, "Medicine");
