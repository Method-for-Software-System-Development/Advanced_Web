/**
 * Prescription Schema model for MongoDB using Mongoose.
 * Defines the structure for prescription documents.
 */

import mongoose, { Document, Schema } from "mongoose";

export interface IPrescription extends Document {
  issueDate: Date;
  medicineType: string;
  medicineName: string;
  quantity: number;
  expirationDate: Date;
  fulfilled: boolean;
  referralType: string;
  petId: mongoose.Types.ObjectId;
  medicineId?: mongoose.Types.ObjectId; // Optional reference to medicine document
}

const PrescriptionSchema: Schema = new Schema({
  issueDate:      { type: Date, required: true },
  medicineType:   { type: String, required: true },
  medicineName:   { type: String, required: true },
  quantity:       { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  fulfilled:      { type: Boolean, default: false },
  referralType:   { type: String, required: true },
  petId:          { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  medicineId:     { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: false }
});

export default mongoose.model<IPrescription>("Prescription", PrescriptionSchema, "Prescription");
