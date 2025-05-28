/**
 * Prescription Schema model for MongoDB using Mongoose.
 * Defines the structure for prescription documents.
 */

import mongoose, { Document, Schema } from "mongoose";

export interface IPrescription extends Document {
  issueDate: Date;
  medicineType: string;
  quantity: number;
  expirationDate: Date;
  fulfilled: boolean;
  referralType: string;
  cost: number;
  appointmentId: mongoose.Types.ObjectId;
}

const PrescriptionSchema: Schema = new Schema({
  issueDate:      { type: Date, required: true },
  medicineType:   { type: String, required: true },
  quantity:       { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  fulfilled:      { type: Boolean, default: false },
  referralType:   { type: String, required: true },
  cost:           { type: Number, required: true },
  appointmentId:  { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true }
});

export default mongoose.model<IPrescription>("Prescription", PrescriptionSchema, "Prescription");
