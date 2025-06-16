import "dotenv/config";
import { Job, Worker } from "bullmq";
import Redis from "ioredis";
import { processPdf } from "../../service/process-document";

console.log(process.env.REDIS_PORT);

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

const fileWorker = new Worker(
  "FileQueue",
  async (job: Job) => {
    console.log(
      `[Worker] Picked up job #${job.id} for file: ${job.data.originalName}`
    );

    const chunk = await processPdf(job.data.filePath);

    console.log(` ✅ Chunk Data from ${job.data.originalName}  ${chunk}`);

    console.log(` ✅ [Worker] Finished job #${job.id}`);

    console.log(
      "-------------------------------------------------------------------"
    );
  },
  { connection }
);

fileWorker.on("completed", (job) => {
  console.log(`Job completed with Job id ${job.id}`);
});

fileWorker.on("failed", (job) => {
  console.log(`Failed job worker`);
});
