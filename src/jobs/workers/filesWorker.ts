import "dotenv/config";
import { Job, Worker } from "bullmq";
import { getKnowledgeCollection } from "../../service/vector-store-service";
import fs from "fs/promises";
import connection from "../../service/redis-service";
import { getDocumentChunks } from "../../service/process-document";

const fileWorker = new Worker(
  "FileQueue",
  async (job: Job) => {
    try {
      console.log(
        `[Worker] Picked up job #${job.id} for file: ${job.data.originalName}`
      );

      const chunks = await getDocumentChunks(job.data.filePath);

      if (!chunks || chunks.length === 0) {
        console.log(
          `No chunks were generated for ${job.data.originalName}. Skipping database insertion.`
        );
      } else {
        const collection = await getKnowledgeCollection();
        console.log(
          `[Worker] Storing ${chunks.length} chunks in the vector database...`
        );
        await collection.add({
          ids: chunks.map((_, index) => `${job.data.originalName}-${index}`),
          metadatas: chunks.map(() => ({ source: job.data.originalName })),
          documents: chunks,
        });
        console.log(
          `[Worker] Successfully stored all chunks for job #${job.id}`
        );
      }

      await fs.unlink(job.data.filePath);
      console.log(`🗑️  Deleted temporary file: ${job.data.filePath}`);
    } catch (error) {
      console.error(`🔴 Error processing job #${job.id}`, error);
      throw error;
    }
  },
  { connection }
);

fileWorker.on("completed", (job) => {
  console.log(`✅ Job completed with Job id ${job.id}`);
});

fileWorker.on("failed", (job, err) => {
  console.error(`🔴 Job #${job?.id} failed with the following error:`);
  console.error(err);
});
