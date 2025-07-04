import { Request, Response } from "express";
import fileQueue from "../../jobs/queues/filesQueue";
import { cleanUpPreviousData } from "../../service/vector-store-service";
import fs from "fs/promises";

export const pdfUploadFilesController = async (
  req: Request,
  res: Response
): Promise<any> => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json("No Files were upload");
  }

  const files = req.files as Express.Multer.File[];
  const jobIds: string[] = []; // arry to hodld job IDs if needed

  try {
    await cleanUpPreviousData();

    for (const file of files) {
      console.log(`Adding job to queue for file: ${file.originalname}`);

      const job = await fileQueue.add("process-pdf", {
        filePath: file.path,
        originalName: file.filename,
      });
      jobIds.push(job.id);
    }

    res.status(200).json({
      message: `Successfully cleared old data and queued ${files.length} new files for processing!`,
      jobIds: jobIds,
    });
  } catch (error) {
    console.error("🔴 FULL ERROR OBJECT IN CONTROLLER:", error);

    for (const file of files) {
      fs.unlink(file.path);
    }

    res.status(500).json({
      message: "An internal server error occurred.",
      error: error.message,
    });
  }
};
