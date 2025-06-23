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

  const jobIds = [].concat(ids as any);

  try {
    const jobs = await Promise.all(
      jobIds.map(async (id) => {
        const job = await fileQueue.getJob(String(id));
        if (!job) return { id, status: "not found", progress: 0 };

        const status = await job.getState();
        const progress = job.progress;
        return { id, status, progress };
      })
    );

    // This object will aggregate all the progress data
    const progressData = {
      documentsProcessed: 0,
      chunksGenerated: 0,
      vectorsStored: 0,
      status: "processing",
    };

    let completedJobs = 0;
    let hasFailedJob = false;

    for (const job of jobs) {
      if (!job) continue;

      if (job.status === "failed") {
        hasFailedJob = true;
        break;
      }
      if (job.status === "completed") {
        completedJobs++;
      }
    }

    progressData.documentsProcessed = completedJobs;

    if (hasFailedJob) {
      progressData.status = "failed";
    } else if (completedJobs === jobs.length) {
      progressData.status = "completed";
    }

    res.status(200).json({
      summary: progressData,
      jobs: jobs,
    });
  } catch (error: any) {
    console.error("🔴 Error fetching job status:", error);
    return res.status(500).json({
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};
