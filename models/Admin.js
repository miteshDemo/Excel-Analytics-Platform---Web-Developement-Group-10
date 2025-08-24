import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  permissions: { type: [String], default: ["manage_users", "view_reports"] }
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);
