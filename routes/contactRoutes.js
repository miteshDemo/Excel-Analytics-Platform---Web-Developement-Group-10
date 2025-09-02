import express from "express";
import ContactRequest from "../models/ContactRequest.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContactRequest = new ContactRequest({ name, email, message });
    await newContactRequest.save();
    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error saving contact request:", error);
    res.status(500).json({ message: "Server error. Failed to send message." });
  }
});

export default router;