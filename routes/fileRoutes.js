import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getFiles, uploadFile, deleteFile, downloadFile } from "../controller/fileController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const UPLOAD_DIR = path.resolve("uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/\s+/g, "_");
    cb(null, `${unique}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only Excel files allowed"));
  },
});

router.get("/", protect, getFiles);
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/download/:id", protect, downloadFile);
router.delete("/:id", protect, deleteFile);

export default router;
