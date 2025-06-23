import express from "express";
import { jobStatusController } from "../controllers/jobs/job-status";

const router = express.Router();

router.get("/status", jobStatusController);

export default router;
