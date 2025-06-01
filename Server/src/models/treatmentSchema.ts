/**
 * Treatment Schema definition for MongoDB using Mongoose.
 * This schema defines the structure for treatment records.
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ITreatment extends Document {
  visitDate: Date;
  visitTime: string;
  vetId: mongoose.Types.ObjectId;
  treatmentType: string;
  cost: number;
  visitationType: string;
  visitationCategory: string;
  notes: string;
  petId: mongoose.Types.ObjectId;
}

const TreatmentSchema: Schema = new Schema({
  visitDate:         { type: Date, required: true },
  visitTime:         { type: String, required: true },
  vetId:             { type: mongoose.Schema.Types.ObjectId, ref: "Vet", required: true },
  treatmentType:     { type: String, required: true },
  cost:              { type: Number, required: true },
  visitationType:    { type: String, required: true },
  visitationCategory:{ type: String, required: true },
  notes:             { type: String, required: true },
  petId:             { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true }
});

export default mongoose.model<ITreatment>("Treatment", TreatmentSchema, "Treatments");
