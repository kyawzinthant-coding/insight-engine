import OpenAI from "openai";

const ollama = new OpenAI({
  baseURL: "http://host.docker.internal:11434/v1",
  apiKey: "ollama",
});

export async function generateLocalChatResponse(
  question: string,
  context: string
): Promise<string> {
  try {
    const response = await ollama.chat.completions.create({
      model: "llama3.1",
      messages: [
        {
          role: "system",
          content: `You are an expert assistant. Using ONLY the provided context, answer the user's question. If the answer is not in the context, say "I cannot find that information in the provided documents."`,
        },
        {
          role: "user",
          content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}`,
        },
      ],
    });
    return (
      response.choices[0].message.content ||
      "Sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error generating local chat response:", error);
    throw new Error("Failed to generate response from local model.");
  }
}

export async function generateLocalEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ollama.embeddings.create({
      model: "nomic-embed-text",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating local embedding:", error);
    throw error;
  }
}
