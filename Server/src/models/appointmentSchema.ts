/**
 * Appointment schema for MongoDB using Mongoose
 */
import mongoose, { Schema, Document } from "mongoose";

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed", 
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show"
}

export enum AppointmentType {
  WELLNESS_EXAM = "wellness_exam",
  VACCINATION = "vaccination",
  SPAY_NEUTER = "spay_neuter",
  DENTAL_CLEANING = "dental_cleaning",
  EMERGENCY_CARE = "emergency_care",
  SURGERY = "surgery",
  DIAGNOSTIC_IMAGING = "diagnostic_imaging",
  BLOOD_WORK = "blood_work",
  FOLLOW_UP = "follow_up",
  GROOMING = "grooming",
  BEHAVIORAL_CONSULTATION = "behavioral_consultation",
  MICROCHIPPING = "microchipping"
}

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Reference to pet owner
  petId: mongoose.Types.ObjectId; // Reference to specific pet
  staffId: mongoose.Types.ObjectId; // Reference to assigned staff member (replaces vetId)
  date: Date; // Appointment date
  time: string; // Appointment time (e.g., "10:30 AM")
  duration: number; // Duration in minutes (default 30)
  type: AppointmentType; // Type of appointment
  status: AppointmentStatus; // Current status
  description: string; // Reason for visit
  notes?: string; // Additional notes from staff
  cost?: number; // Estimated or actual cost
  reminderSent: boolean; // Whether reminder was sent
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users", 
    required: true 
  },
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Pet", 
    required: true 
  },
  staffId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Staff", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true,
    match: /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/ // Format: "10:30 AM"
  },
  duration: { 
    type: Number, 
    default: 30,
    min: 15,
    max: 240 // 4 hours max
  },
  type: { 
    type: String, 
    enum: Object.values(AppointmentType),
    required: true 
  },
  status: { 
    type: String, 
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.SCHEDULED 
  },
  description: { 
    type: String, 
    required: true,
    maxLength: 500 
  },
  notes: { 
    type: String, 
    maxLength: 1000 
  },
  cost: { 
    type: Number, 
    min: 0 
  },
  reminderSent: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
AppointmentSchema.index({ date: 1, time: 1 });
AppointmentSchema.index({ staffId: 1, date: 1 });
AppointmentSchema.index({ userId: 1 });
AppointmentSchema.index({ petId: 1 });
AppointmentSchema.index({ status: 1 });

// Compound index to prevent double booking
AppointmentSchema.index({ 
  staffId: 1, 
  date: 1, 
  time: 1 
}, { 
  unique: true,
  partialFilterExpression: { 
    status: { $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] } 
  }
});

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema, "Appointment");
