import { Request, Response } from "express";
import { getAllKnowledge } from "../../service/vector-store-service";
import { streamSummaryResponse } from "../../service/local-ai-service";

export const SummarizeController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const allDocs = await getAllKnowledge();
    const formattedContext = allDocs.join("\n---\n");

    if (!formattedContext) {
      return res
        .status(400)
        .json({ message: "No content available to summarize." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const response = await streamSummaryResponse(formattedContext);

    response.data.on("data", (chunk: Buffer) => {
      const jsonString = chunk.toString("utf-8");

      const jsonObjects = jsonString.split("\n").filter(Boolean);

      for (const obj of jsonObjects) {
        const parsed = JSON.parse(obj);
        const content = parsed.message?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ token: content })}\n\n`);
        }
      }
    });

    response.data.on("end", () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });
  } catch (error: any) {
    console.error("🔴 Error in summarize controller:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "An error occurred while generating a summary.",
        error: error.message,
      });
    } else {
      res.end();
    }
  }
};
