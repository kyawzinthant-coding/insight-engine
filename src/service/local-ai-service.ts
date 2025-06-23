import axios from "axios";
import OpenAI from "openai";

const ollama = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  apiKey: "ollama",
});

const ollama_url = `${
  process.env.OLLAMA_BASE_URL || "http://localhost:11434"
}/api`;

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
    console.log("text", text);

    const response = await axios.post(`${ollama_url}/embeddings`, {
      model: "nomic-embed-text", // Using the dedicated embedding model
      prompt: text, // The Ollama API uses 'prompt' for the input text here
    });

    // const response = await ollama.embeddings.create({
    //   model: "llama3.1",
    //   input: text,
    // });

    const embedding = response.data.embedding;
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Invalid embedding response format.");
    }

    console.log("Generated local embedding:", response);
    return embedding;
  } catch (error) {
    console.error("Error generating local embedding:", error);
    throw error;
  }
}

export async function streamSummaryResponse(context: string) {
  try {
    const stream = await axios.post(
      "http://localhost:11434/api/chat",
      {
        model: "llama3.1",
        messages: [
          {
            role: "system",
            content: `You are an expert summarizer. Your job is to provide a concise, well-structured summary of the provided context. Use Markdown for formatting, including a main title, bullet points, and bold text for key ideas.`,
          },
          {
            role: "user",
            content: `CONTEXT:\n${context}\n\nPlease provide a summary of the text above.`,
          },
        ],
        stream: true,
      },
      { responseType: "stream" }
    );

    return stream;
  } catch (error) {
    console.error("Error creating summary stream:", error);
    throw new Error("Failed to create summary stream from local model.");
  }
}
