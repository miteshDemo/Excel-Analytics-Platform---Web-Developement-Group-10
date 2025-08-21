import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = "mitesh123@#$"; // Move to .env in production

// LOGIN Route
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email is not registered" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Role validation (optional)
    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not a ${role}` });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
