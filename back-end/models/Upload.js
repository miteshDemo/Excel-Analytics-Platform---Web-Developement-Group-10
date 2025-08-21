import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    fileUrl: { type: String }, // optional if you store path
  },
  { timestamps: true }
);

export default mongoose.model("Upload", uploadSchema);
