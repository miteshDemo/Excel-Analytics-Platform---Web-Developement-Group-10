// routes/admin.js (or a new file like routes/adminContact.js)
import express from "express";
import ContactRequest from "../models/contactRequest.js";
import auth from "../middleware/auth.js"; // Your authentication middleware
import admin from "../middleware/admin.js"; // Your admin authorization middleware

const router = express.Router();

// Protect this route with both authentication and admin authorization
router.get("/contact-requests", auth, admin, async (req, res) => {
  try {
    const requests = await ContactRequest.find().sort({ date: -1 }); // Get all requests, sorted by date
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching contact requests:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Add a route to delete a contact request
router.delete("/contact-requests/:id", auth, admin, async (req, res) => {
    try {
        await ContactRequest.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Contact request deleted successfully." });
    } catch (error) {
        console.error("Error deleting contact request:", error);
        res.status(500).json({ message: "Server error." });
    }
});

export default router;