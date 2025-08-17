import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(express.json());
app.use(cors()); 


const MONGO_URI = "mongodb://127.0.0.1:27017/jwt_auth";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.use("/api/auth", authRoutes); 

app.get("/", (req, res) => res.send("API running..."));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
