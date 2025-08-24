import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import path from "path";

import User from "./models/User.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/adminRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
// ❌ Do NOT import the model just to mount it as middleware
// import Analysis from "./models/Analysis.js";
import analysisRoutes from "./routes/analysisRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❌ WRONG (remove this): app.use("/api/analysis", Analysis);
// ✅ RIGHT: mount the router
app.use("/api/analysis", analysisRoutes);

// Serve uploads
app.use("/uploads", express.static(path.resolve("uploads")));

// MongoDB
const MONGO_URI = "mongodb://127.0.0.1:27017/jwt_auth";

// Auto-create Admin
const createAdmin = async () => {
  try {
    const adminEmail = "admin1@gmail.com";
    const adminPassword = "admin123";
    const adminName = "Mitesh";

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      await admin.save();
      console.log("✅ Default Admin created:", adminEmail);
    } else {
      console.log("ℹ️ Admin already exists:", adminEmail);
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

// Connect MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await createAdmin();
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Other routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/files", fileRoutes);

// Default route
app.get("/", (req, res) => res.send("🚀 API running..."));

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
