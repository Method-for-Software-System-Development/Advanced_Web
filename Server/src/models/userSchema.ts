/**
 * User model/schema definition for MongoDB using Mongoose.
 * Matches the fields from the React registration form.
 */

import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcryptjs';
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    street: string;
    city: string;
    postalCode?: string; // optional
    pets: mongoose.Types.ObjectId[];
    role?: "user" | "secretary"; // User role, default is "user"
    resetPasswordCode?: string;
    resetPasswordExpires?: Date;


}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, unique: true, required: true },
    phone:     { type: String, required: true },
    password:  { type: String, required: true },
    street:    { type: String, required: true },
    city:      { type: String, required: true },
    postalCode:{ type: String }, // optional
    pets:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet", default: [] }],
    role: { type: String, enum: ["user", "secretary"], default: "user" },
    resetPasswordCode: { type: String }, // resetPasswordCode: stores the 6-digit code sent to the user for password reset
    resetPasswordExpires: { type: Date } // resetPasswordExpires: indicates when the code expires 


}, { collection: "Users", versionKey: false });

/**
 * Pre-save hook for User schema.
 * If the password field is modified, hash the password before saving to the database.
 * This ensures that plaintext passwords are never stored in the database.
 * Uses bcryptjs for hashing.
 * 
 * TypeScript note:
 * We specify <IUser> to help TypeScript understand what `this` refers to inside the hook.
 */
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if password was changed
  try {
    this.password = await bcrypt.hash(this.password, 10); // Hash with saltRounds=10
    next(); // Proceed to save
  } catch (err) {
    next(err as any); // Pass error to mongoose
  }
});


export default mongoose.model<IUser>("Users", UserSchema);
