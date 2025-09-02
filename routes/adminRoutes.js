import express from "express";
import { protect, adminOnly, superAdminOnly } from "../middleware/auth.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getSummary,
  createUserOrAdmin, // New Controller
} from "../controller/adminController.js";

const router = express.Router();

// Routes for Admin & Super Admin
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/summary", protect, adminOnly, getSummary);

// Super Admin only route to create new user or admin
router.post("/create", protect, superAdminOnly, createUserOrAdmin);

export default router;
