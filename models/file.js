import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    // Shown to user
    name: { type: String, required: true }, // original filename
    uploadedAt: { type: Date, default: Date.now },
    userId: { type: String, required: true },

    // Storage metadata
    path: { type: String, required: true },   // disk path like uploads/abc123.xlsx
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },   // bytes
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
