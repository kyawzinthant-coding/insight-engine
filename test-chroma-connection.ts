import { ChromaClient } from "chromadb";

async function main() {
  console.log("--- Running Isolated ChromaDB Connection Test ---");

  console.log("Attempting to create client with host: 127.0.0.1, port: 8000");

  const client = new ChromaClient({
    host: "127.0.0.1",
    port: 8000,
  });

  try {
    console.log("Client created. Attempting to get heartbeat...");
    const heartbeat = await client.heartbeat();
    console.log("✅✅✅ SUCCESS: ChromaDB heartbeat received:", heartbeat);
    console.log(
      "\nThis confirms the connection from Node.js is working correctly."
    );
  } catch (error) {
    console.error("🔴🔴🔴 FAILED: The isolated connection test failed.");
    console.error(
      "This means the issue is fundamental to the Node.js client or your environment."
    );
    console.error("The full error is:", error);
  }
}

main();
