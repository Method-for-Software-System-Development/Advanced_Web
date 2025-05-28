/**
 * User model/schema definition for MongoDB using Mongoose.
 * Matches the fields from the React registration form.
 */

import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    country: string;
    postalCode?: string; // optional
    pets: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, unique: true, required: true },
    phone:     { type: String, required: true },
    password:  { type: String, required: true },
    city:      { type: String, required: true },
    country:   { type: String, required: true },
    postalCode:{ type: String }, // optional
    pets:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet", default: [] }]
}, { collection: "Users", versionKey: false });

export default mongoose.model<IUser>("Users", UserSchema);
