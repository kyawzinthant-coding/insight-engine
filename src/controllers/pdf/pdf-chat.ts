// src/controllers/pdf/pdf-chat.ts
import { Request, Response } from "express";
import { queryKnowledgeBase } from "../../service/vector-store-service";
import { generateChatResponse } from "../../service/ai-response-service";
import { generateLocalChatResponse } from "../../service/local-ai-service";
import OpenAI from "openai";

const ollama = new OpenAI({
  baseURL: "http://host.docker.internal:11434/v1",
  apiKey: "ollama",
});
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

    // 1. Retrieve relevant context from your knowledge base
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

    const stream = await ollama.chat.completions.create({
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
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      // Format the chunk in the Server-Sent Event format
      console.log("Chunk received:", content);
      res.write(`data: ${JSON.stringify({ token: content })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // res.status(200).json({ answer });
  } catch (error: any) {
    console.error("🔴 Error in chat controller:", error);
    res.status(500).json({
      message: "An error occurred while generating a response.",
      error: error.message,
    });
  }
};
