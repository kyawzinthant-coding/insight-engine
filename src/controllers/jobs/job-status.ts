import { Request, Response } from "express";
import fileQueue from "../../jobs/queues/filesQueue";

export const jobStatusController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ message: "Job ID(s) must be provided." });
  }

  // This robustly handles both a single ID (string) and multiple IDs (array)
  // by ensuring jobIds is always an array.
  const jobIds = [].concat(ids as any);

  try {
    const jobs = await Promise.all(
      jobIds.map((id) => fileQueue.getJob(String(id)))
    );

    let overallStatus = "processing";
    const totalJobs = jobs.length;
    let completedCount = 0;
    let hasFailedJob = false;

    for (const job of jobs) {
      if (!job) continue;
      const state = await job.getState();

      if (state === "failed") {
        hasFailedJob = true;
        break;
      }
      if (state === "completed") {
        completedCount++;
      }
    }

    if (hasFailedJob) {
      overallStatus = "failed";
    } else if (completedCount === totalJobs) {
      overallStatus = "completed";
    }

    res.status(200).json({
      status: overallStatus,
      completed: completedCount,
      total: totalJobs,
    });
  } catch (error: any) {
    console.error("🔴 Error fetching job status:", error);
    return res.status(500).json({
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};
