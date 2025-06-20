import express from "express";
import { jobStatusController } from "../controllers/jobs/job-status";

const router = express.Router();

// Example route: /api/v1/jobs/status?ids[]=1&ids[]=2
router.get("/status", jobStatusController);

export default router;
