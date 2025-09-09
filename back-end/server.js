import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/adminRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import contactRoutes from "./routes/contactRoutes.js"; // added contact messages

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/contact", contactRoutes); // contact route for saving messages

// Serve uploads folder
app.use("/uploads", express.static(path.resolve("uploads")));

// Default route
app.get("/", (req, res) => res.send("🚀 Server is running..."));

// MongoDB connection
const MONGO_URI = "mongodb://127.0.0.1:27017/jwt_auth";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Start server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
