// models/User.js (for website backend)
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: Number,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    phoneNumber: { type: String },
    cnic: { type: String, unique: true },
    email: { type: String },
    password: { type: String },
    role: { type: String, enum: ["patient", "worker"] },
    isApproved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema, "users");
// note the last "users" => force it to use the existing collection

export default User;
