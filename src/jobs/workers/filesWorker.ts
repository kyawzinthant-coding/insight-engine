import "dotenv/config";
import { Job, Worker } from "bullmq";
import { processPdf } from "../../service/process-document";
import { getKnowledgeCollection } from "../../service/vector-store-service";
import fs from "fs/promises";
import connection from "../../service/redis-service";

const fileWorker = new Worker(
  "FileQueue",
  async (job: Job) => {
    console.log(
      `[Worker] Picked up job #${job.id} for file: ${job.data.originalName}`
    );

    const chunk = await processPdf(job.data.filePath);

    console.log(` ✅ Chunk Data from ${job.data.originalName} `);

    console.log(` ✅ [Worker] Finished job #${job.id}`);
    await fs.unlink(job.data.filePath);

    const collection = await getKnowledgeCollection();

    console.log(
      `[Worker] Storing ${chunk.length} chunks in the vector database...`
    );

    await collection.add({
      ids: chunk.map((_, index) => `${job.data.originalName}-${index}`), // Create unique IDs
      metadatas: chunk.map(() => ({ source: job.data.originalName })), // Store the source
      documents: chunk, // The actual text chunks
    });

    console.log(`[Worker] Successfully stored all chunks for job #${job.id}`);

    console.log(
      "-------------------------------------------------------------------"
    );
  },
  { connection }
);

fileWorker.on("completed", (job) => {
  console.log(`Job completed with Job id ${job.id}`);
});

fileWorker.on("failed", (job, err) => {
  console.error(`🔴 Job #${job?.id} failed with the following error:`);
  console.error(err);
});
