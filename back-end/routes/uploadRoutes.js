// routes/uploadRoutes.js
import express from "express";
import Upload from "../models/upload.js";
import authMiddleware from "../middleware/auth.js"; // verify JWT

const router = express.Router();

/**
 * @route   GET /api/uploads/total
 * @desc    Get total uploads count
 * @access  SuperAdmin only
 */
router.get("/total", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const count = await Upload.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error fetching total uploads:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/uploads
 * @desc    Get all uploaded files
 * @access  SuperAdmin only
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const uploads = await Upload.find().populate("user", "name email role").sort({ createdAt: -1 });
    res.json(uploads);
  } catch (err) {
    console.error("Error fetching uploads:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
