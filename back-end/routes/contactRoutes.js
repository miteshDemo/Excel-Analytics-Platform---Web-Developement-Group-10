import express from "express";
import ContactRequest from "../models/ContactRequest.js";
const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const newRequest = new ContactRequest(req.body);
    await newRequest.save();
    res.status(201).json({ message: "Request submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const requests = await ContactRequest.find().sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
