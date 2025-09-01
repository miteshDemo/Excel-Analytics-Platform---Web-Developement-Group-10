import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    userId: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    parsedData: { type: Array, default: [] } 
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
