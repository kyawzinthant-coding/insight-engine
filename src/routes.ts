import express from "express";

import pdfRouter from "./routes/PDF-routes";
import urlRouter from "./routes/url-routes";

const router = express.Router();

router.use("/api/v1/pdf", pdfRouter);
router.use("/api/v1/url", urlRouter);

export default router;
