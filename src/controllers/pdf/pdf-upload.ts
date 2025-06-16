import { Request, Response } from "express";
import { processPdf } from "../../service/process-document";
import fileQueue from "../../jobs/queues/filesQueue";

export const pdfUploadFilesController = async (
  req: Request,
  res: Response
): Promise<any> => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json("No Files were upload");
  }

  const files = req.files as Express.Multer.File[];

  const fileInfo = files.map((file) => ({
    filename: file.filename,
    path: file.path,
  }));

  try {
    for (const file of files) {
      console.log(`Adding job to queue for file: ${file.originalname}`);

      await fileQueue.add("process-pdf", {
        filePath: file.path,
        originalName: file.filename,
      });
    }
  } catch (error) {
    console.log("Queue Job Worker Error", error.message);
  }

  res.status(200).json({
    message: `${files.length} files uploaded successfully!`,
    files: fileInfo,
  });
};
