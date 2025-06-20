import express from "express";

import pdfRouter from "./routes/PDF-routes";
import urlRouter from "./routes/url-routes";
import jobRouter from "./routes/Job-routes";

const router = express.Router();

router.use("/api/v1/pdf", pdfRouter);
router.use("/api/v1/url", urlRouter);
router.use("/api/v1/jobs", jobRouter);

export default router;
