import File from "../models/file.js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

// Upload & Parse Excel
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const newFile = await File.create({
      name: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      userId: req.user.id,
      parsedData: jsonData
    });

    res.status(201).json({ message: "File uploaded and parsed", file: newFile });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
};

// Get All Files
export const getFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Error fetching files", error: error.message });
  }
};

// Download File
export const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    res.download(path.resolve(file.path));
  } catch (error) {
    res.status(500).json({ message: "Error downloading file", error: error.message });
  }
};

// Delete File
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    fs.unlinkSync(file.path);
    await file.deleteOne();
    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting file", error: error.message });
  }
};
