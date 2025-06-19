import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

async function extractTextFromFile(filePath: string): Promise<string> {
  const extension = path.extname(filePath).toLowerCase();
  console.log(
    `Attempting to extract text from file with extension: ${extension}`
  );

  switch (extension) {
    case ".pdf":
      const pdfBuffer = await fs.readFile(filePath);
      const pdfData = await pdf(pdfBuffer);
      return pdfData.text;

    case ".docx":
      const docxResult = await mammoth.extractRawText({ path: filePath });
      return docxResult.value;

    case ".txt":
      return fs.readFile(filePath, "utf8");

    default:
      console.error(`Unsupported file type: ${extension}`);
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

export async function getDocumentChunks(filePath: string): Promise<string[]> {
  try {
    const extractedText = await extractTextFromFile(filePath);

    if (!extractedText) {
      console.log(`No text extracted from ${path.basename(filePath)}.`);
      return []; // Return empty array if no text
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(extractedText);
    console.log(`✅ Text chunked successfully for ${path.basename(filePath)}.`);
    console.log(`   - Number of chunks created: ${chunks.length}`);
    return chunks;
  } catch (error) {
    console.error(
      `An error occurred during document processing for ${filePath}:`,
      error
    );

    return [];
  }
}
