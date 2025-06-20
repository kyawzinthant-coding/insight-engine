import multer from "multer";
import express, { Request, Response } from "express";
import path from "path";

import fs from "fs";

const UPLOADS_FOLDER = "./uploads";

if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER);
}

const storage = multer.diskStorage({
  // destination tells Multer where to save the files
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, UPLOADS_FOLDER);
  },
  // filename tells Multer how to name the files
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Use the original file name with a timestamp to ensure uniqueness
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

export const upload = multer({ storage: storage });
