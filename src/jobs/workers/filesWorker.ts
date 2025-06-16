import { Job, Worker } from "bullmq";
import Redis from "ioredis";
import { processPdf } from "../../service/process-document";

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

const fileWorker = new Worker(
  "FileQueue",
  async (job: Job) => {
    console.log(
      `[Worker] Picked up job #${job.id} for file: ${job.data.originalName}`
    );

    await processPdf(job.data.filePath);

    console.log(`[Worker] Finished job #${job.id}`);
  },
  { connection }
);

fileWorker.on("completed", (job) => {
  console.log(`Job completed with Job id ${job.id}`);
});

fileWorker.on("failed", (job) => {
  console.log(`Failed job worker`);
});
