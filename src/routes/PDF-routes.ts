import express from "express";
import { pdfUploadFilesController } from "../controllers/pdf/pdf-upload";
import { upload } from "../middleware/uploadfiles";
import { pdfChatController } from "../controllers/pdf/pdf-chat";
import { SummarizeController } from "../controllers/pdf/summarize";
const router = express.Router();

router.post("/uploads", upload.array("files", 10), pdfUploadFilesController);
router.post("/chat", pdfChatController);
router.post("/summarize", SummarizeController);
export default router;
