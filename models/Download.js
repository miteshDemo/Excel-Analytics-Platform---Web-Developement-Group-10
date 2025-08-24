  import mongoose from "mongoose";

  const downloadSchema = new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      file: { type: mongoose.Schema.Types.ObjectId, ref: "Upload" },
    },
    { timestamps: true }
  );

  export default mongoose.model("Download", downloadSchema);
