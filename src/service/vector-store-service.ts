import { ChromaClient, EmbeddingFunction } from "chromadb";
import { generateEmbedding } from "./embedding-service";

const client = new ChromaClient({
  host: process.env.CHROMA_HOST || "localhost",
  port: parseInt(process.env.CHROMA_PORT || "8000"),
});

class GoogleAIEmbeddingFunction implements EmbeddingFunction {
  public async generate(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }
}

const embedder = new GoogleAIEmbeddingFunction();

export async function getKnowledgeCollection() {
  const collection = await client.getOrCreateCollection({
    name: "insight_engine_knowledge",
    embeddingFunction: embedder,
  });
  return collection;
}

export async function queryKnowledgeBase(question: string) {
  const collection = await getKnowledgeCollection();

  const results = await collection.query({
    queryTexts: [question],
    nResults: 5,
  });

  console.log(results);

  return results.documents[0];
}

export async function cleanUpPreviousData() {
  try {
    await client.deleteCollection({ name: "insight_engine_knowledge" });
    console.log("✅ Previous collection deleted successfully.");
  } catch (error: any) {
    if (error.name === "ChromaNotFoundError") {
      console.log("No previous collection to delete. Starting fresh.");
    } else {
      console.log(error);
      throw error;
    }
  }
}
