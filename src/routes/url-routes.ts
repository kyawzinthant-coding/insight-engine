import express from "express";
import { urlIngestController } from "../controllers/url/url-ingest";
const router = express.Router();

router.post("/ingest", urlIngestController);

export default router;
