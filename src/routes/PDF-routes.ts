import express from "express";
import { pdfUploadFilesController } from "../controllers/pdf/pdf-upload";
import { upload } from "../middleware./uploadfiles";
import { pdfChatController } from "../controllers/pdf/pdg-chat";
const router = express.Router();

router.post("/uploads", upload.array("files", 10), pdfUploadFilesController);
router.post("/chat", pdfChatController);

export default router;
