import fs from "fs/promises";

import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function processPdf(filePath: string) {
  try {
    const pdfBuffer = await fs.readFile(filePath);

    const pdfData = await pdf(pdfBuffer);

    const extractedText = pdfData.text;

    console.log(`✅ Text extracted successfully.`);
    // console.log(`   - Total Pages: ${pdfData.numpages}`);
    // console.log(`   - Text Length: ${extractedText.length} characters\n`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Max characters per chunk
      chunkOverlap: 200, // Characters to overlap between chunks
    });

    const chunks = await splitter.splitText(extractedText);

    console.log(`✅ Text chunked successfully for ${filePath}.`);
    console.log(`   - Number of chunks created: ${chunks.length}\n`);

    // for (let i = 0; i < Math.min(1, chunks.length); i++) {
    //   console.log(`\n--- Chunk ${i + 1} (Length: ${chunks[i].length}) ---`);
    //   console.log(chunks[i]);
    //   console.log("-------------------------------------\n");
    // }

    // if (chunks.length > 3) {
    //   console.log(`... and ${chunks.length - 3} more chunks.`);
    // }

    return chunks;
  } catch (error) {
    console.error("An error occurred during PDF processing:", error);
  }
}
