// src/controllers/pdf/pdf-chat.ts
import { Request, Response } from "express";
import { queryKnowledgeBase } from "../../service/vector-store-service";
import { generateChatResponse } from "../../service/ai-response-service";

export const pdfChatController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required." });
    }

    // 1. Retrieve relevant context from your knowledge base
    const context = await queryKnowledgeBase(question);

    console.log("context", context);

    // 2. Generate a response from the AI using the context
    const answer = await generateChatResponse(question, context);

    res.status(200).json({ answer });
  } catch (error: any) {
    console.error("🔴 Error in chat controller:", error);
    res.status(500).json({
      message: "An error occurred while generating a response.",
      error: error.message,
    });
  }
};
