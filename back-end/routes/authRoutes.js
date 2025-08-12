import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected
router.get("/profile", protect, getProfile);

// Admin only example route
router.get("/admin-data", protect, adminOnly, (req, res) => {
  res.json({ message: "This is admin-only data" });
});

export default router;
