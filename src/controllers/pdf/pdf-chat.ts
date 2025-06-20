import { Request, Response } from "express";
import { queryKnowledgeBase } from "../../service/vector-store-service";

import axios from "axios";

export const pdfChatController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    console.log("🔵 PDF Chat Controller called with body:", req.body);
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required." });
    }

    const rawContext = await queryKnowledgeBase(question);
    const context: { text: string; source: string }[] = rawContext
      .filter((item: any) => typeof item.source === "string")
      .map((item: any) => ({
        text: item.text,
        source: String(item.source),
      }));

    const formattedContext = context
      .map((item: any) => item.text)
      .join("\n---\n");

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const response = await axios.post(
      "http://localhost:11434/api/chat",
      {
        model: "llama3.1",
        messages: [
          {
            role: "system",
            content: `You are an expert assistant. Using ONLY the provided context, answer the user's question.`,
          },
          {
            role: "user",
            content: `CONTEXT:\n${formattedContext}\n\nQUESTION:\n${question}`,
          },
        ],
        stream: true,
      },
      { responseType: "stream" }
    );

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
    console.error("🔴 Error in chat controller:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "An error occurred while generating a response.",
        error: error.message,
      });
    } else {
      res.end();
    }
  }
};
