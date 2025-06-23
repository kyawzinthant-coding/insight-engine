import "dotenv/config";
import { Job, Worker } from "bullmq";
import { getKnowledgeCollection } from "../../service/vector-store-service";
import fs from "fs/promises";
import connection from "../../service/redis-service";
import { getDocumentChunks } from "../../service/process-document";
import { getUrlChunks } from "../../service/url-document";

const fileWorker = new Worker(
  "FileQueue",
  async (job: Job) => {
    try {
      console.log(`[Worker] Picked up job #${job.id} for file: ${job.name}`);
      let chunks: string[] = [];
      let sourceName: string = "";

      await job.updateProgress({ stage: "chunking", progress: 0 });

      if (job.name === "process-pdf") {
        chunks = await getDocumentChunks(job.data.filePath);
        sourceName = job.data.originalName;
      } else if (job.name === "process-url") {
        chunks = await getUrlChunks(job.data.url);
        sourceName = job.data.url;
      }

      await job.updateProgress({
        stage: "chunking",
        progress: 100,
        chunkCount: chunks.length,
      });

      if (!chunks || chunks.length === 0) {
        console.log(`No chunks generated for ${sourceName}. Skipping.`);
        // If it was a file job, we should still clean it up
        if (job.name === "process-pdf") {
          await fs.unlink(job.data.filePath);
          console.log(`🗑️  Deleted temporary file: ${job.data.filePath}`);
        }
        return;
      }

      const collection = await getKnowledgeCollection();
      const totalChunks = chunks.length;

      for (let i = 0; i < totalChunks; i++) {
        const chunk = chunks[i];

        await collection.add({
          ids: [`${sourceName}-${i}`],
          metadatas: [{ source: sourceName }],
          documents: [chunk],
        });

        // Report progress as a percentage (0-100)
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        await job.updateProgress(progress);
      }

      await job.updateProgress({
        stage: "embedding",
        progress: 100,
        vectorCount: chunks.length,
      });

      console.log(
        `[Worker] Successfully stored ${chunks.length} chunks for ${sourceName}`
      );

      if (job.name === "process-pdf") {
        await fs.unlink(job.data.filePath);
        console.log(`🗑️  Deleted temporary file: ${job.data.filePath}`);
      }
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
