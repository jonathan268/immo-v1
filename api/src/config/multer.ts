import multer from "multer";
import { Request } from "express";
import { AppError } from "../middlewares/error.middleware";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB par fichier
const MAX_FILES = 10;

// Stockage en mémoire — Cloudinary gère la persistance
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new AppError("Only JPEG, PNG and WEBP images are allowed", 400));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});