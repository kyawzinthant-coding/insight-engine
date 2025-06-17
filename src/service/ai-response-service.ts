import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateChatResponse(
  question: string,
  context: string[]
): Promise<string> {
  // Construct a detailed prompt for the AI
  const prompt = `You are an expert assistant.
   Using ONLY the following context from documents,
    please answer the user's question.
    The context is provided in a JSON array. 
    If the answer is not in the context, say 'I cannot find that information in the provided documents.'

  Context:
  ${JSON.stringify(context)}

  User's Question:
  ${question}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate response from AI model.");
  }
}
