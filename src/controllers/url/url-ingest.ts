import { Request, Response } from "express";
import fileQueue from "../../jobs/queues/filesQueue";
import { cleanUpPreviousData } from "../../service/vector-store-service";

export const urlIngestController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    console.log(req.body);
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required." });
    }

    await cleanUpPreviousData();

    await fileQueue.add("process-url", {
      url: url,
    });

    res.status(200).json({
      message: `Successfully queued URL for processing: ${url}`,
    });
  } catch (error) {
    console.error("🔴 Error in URL ingest controller:", error);
    res.status(500).json({
      message: "An error occurred while generating a response.",
      error: error.message,
    });
  }
};
