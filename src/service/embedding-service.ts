import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "embedding-001" });

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}
