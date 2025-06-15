import express from "express";
import { upload } from "./middleware./uploadfiles";
import pdfRouter from "./routes/PDF-routes";

const router = express.Router();

router.use("/api/v1/pdf", pdfRouter);

export default router;
