import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    file: { type: mongoose.Schema.Types.ObjectId, ref: "Upload" },
    result: { type: String }, // e.g., summary, status
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);
