import express from "express";
import { registerUser, loginUser } from "../controller/authController.js";

const router = express.Router();

// REGISTER Route
router.post("/register", registerUser);

// LOGIN Route
router.post("/login", loginUser);

export default router;
