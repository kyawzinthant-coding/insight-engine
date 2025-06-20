import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-latest" });

export async function generateChatResponse(
  question: string,
  context: { text: string; source: string }[]
): Promise<string> {
  console.log("--- DEBUGGING AI RESPONSE SERVICE ---");

  // Step 1: Format the context into the simplest possible string.
  const formattedContext = context
    .map((item) => item.text.trim())
    .join("\n---\n");

  // Step 2: Create a very simple and direct prompt.
  const prompt = `Answer the question "${question}" using ONLY the information provided in the context below.

CONTEXT:
${formattedContext}
`;

  // Step 3: Log the exact, final prompt being sent to the AI. This is our ground truth.
  console.log("\n--- FINAL PROMPT BEING SENT TO GEMINI ---");
  console.log(prompt);
  console.log("----------------------------------------\n");

  try {
    // Step 4: Use the simplest possible API call method (passing a single string).
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("🔴 Error generating chat response:", error);
    throw new Error("Failed to generate response from AI model.");
  }
}
