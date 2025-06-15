import express from "express";
import { pdfUploadFilesController } from "../controllers/pdf/pdf-upload";
import { upload } from "../middleware./uploadfiles";
const router = express.Router();

router.post("/uploads", upload.array("files", 10), pdfUploadFilesController);

export default router;
