import { getKnowledgeCollection } from "./service/vector-store-service";

async function inspectDatabase() {
  console.log("--- Starting Database Inspection ---");

  try {
    // Get a reference to our existing collection
    const collection = await getKnowledgeCollection();

    const totalCount = await collection.count();
    console.log(
      `\n✅ Collection 'insight_engine_knowledge' currently has ${totalCount} documents stored.\n`
    );

    if (totalCount === 0) {
      console.log("The database is empty. Try processing some files first!");
      return;
    }

    const queryText = "what are the main points";

    const queryResult = await collection.query({
      queryTexts: [queryText],
      nResults: 10,
    });

    for (let i = 0; i < queryResult.documents[0].length; i++) {
      console.log(`\n-------------------------------------`);
      console.log(`Result #${i + 1}`);
      console.log(`  - Source: ${queryResult.metadatas[0][i]?.source}`);
      console.log(`  - Document Text: "${queryResult.documents[0][i]}"`);
    }

    console.log(`\n-------------------------------------\n`);
  } catch (error) {
    console.error("An error occurred during database inspection:", error);
  } finally {
    console.log("--- Inspection Complete ---");
  }
}

// Run the inspection function
inspectDatabase();
