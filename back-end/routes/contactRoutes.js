import express from "express";
import Contact from "../models/Contact.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();


// @route   POST /api/contact
// @desc    Save customer contact message (frontend customer form)
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = await Contact.create({ name, email, message });

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   GET /api/contact
// @desc    Admin can view all messages
// @access  Admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   PATCH /api/contact/:id
// @desc    Update status of message (admin marks resolved/in-progress)
// @access  Admin
router.patch("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Message not found" });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   DELETE /api/contact/:id
// @desc    Admin deletes a message
// @access  Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Message not found" });

    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
