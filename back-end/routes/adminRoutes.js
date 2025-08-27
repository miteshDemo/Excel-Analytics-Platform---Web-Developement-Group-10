import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getSummary,
} from "../controller/adminController.js";

const router = express.Router();


router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/summary", protect, adminOnly, getSummary);

export default router;
