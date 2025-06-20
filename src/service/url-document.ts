import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as cheerio from "cheerio";
import { chromium } from "playwright";

export async function getTextFromUrl(url: string): Promise<string> {
  let browser = null;
  try {
    console.log(`Launching headless browser with Playwright to scrape: ${url}`);

    // 2. Launch a new browser instance
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // 3. Navigate to the page and wait for it to be fully loaded
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2000);

    // 4. Get the fully rendered HTML content
    const html = await page.content();
    const $ = cheerio.load(html);

    $("script, style, nav, footer, header, .navbar, .sidebar").remove();
    const text = $("body").text().replace(/\s\s+/g, " ").trim();

    console.log(`✅ Successfully scraped URL with Playwright.`);
    return text;
  } catch (error) {
    console.error(`Failed to scrape URL with Playwright: ${url}`, error);
    throw new Error(`Failed to scrape URL with Playwright:
   ${url}`);
  } finally {
    // 5. Ensure the browser is always closed
    if (browser) {
      await browser.close();
      console.log("Headless browser closed.");
    }
  }
}

export async function getUrlChunks(url: string): Promise<string[]> {
  try {
    const extractedText = await getTextFromUrl(url);

    if (!extractedText) {
      console.log(`No text extracted from ${url}.`);
      return [];
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(extractedText);
    console.log(`\u2705 Text chunked successfully from URL: ${url}`);
    console.log(`   - Number of chunks created: ${chunks.length}`);
    return chunks;
  } catch (error) {
    console.error(`An error occurred during URL processing for ${url}:`, error);
    return [];
  }
}
