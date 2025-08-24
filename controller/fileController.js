import fs from "fs";
import path from "path";
import File from "../models/file.js";

// POST /api/files/upload (multer already parsed file)
export const uploadFile = async (req, res) => {
  try {
    // req.file provided by multer.single('file')
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const newFile = new File({
      name: req.file.originalname,
      uploadedAt: new Date(),
      userId: req.user.id,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    await newFile.save();
    return res.status(201).json(newFile);
  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ error: "Failed to upload file" });
  }
};

// GET /api/files
export const getFiles = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const files = await File.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    return res.json(files);
  } catch (err) {
    console.error("Fetch Error:", err);
    return res.status(500).json({ error: "Failed to fetch files" });
  }
};

// GET /api/files/download/:id
export const downloadFile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const file = await File.findOne({ _id: req.params.id, userId: req.user.id });
    if (!file) return res.status(404).json({ error: "File not found" });

    // Ensure file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(410).json({ error: "File is missing on server" });
    }

    return res.download(file.path, file.name);
  } catch (err) {
    console.error("Download Error:", err);
    return res.status(500).json({ error: "Failed to download file" });
  }
};

// DELETE /api/files/:id
export const deleteFile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // best-effort remove from disk
    try {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (e) {
      console.warn("Could not remove file from disk:", e.message);
    }

    return res.json({ message: "File deleted successfully", id: req.params.id });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ error: "Failed to delete file" });
  }
};
