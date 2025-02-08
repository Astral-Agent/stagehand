/**
 * 🤘 Welcome to Stagehand!
 *
 * TO RUN THIS PROJECT:
 * ```
 * npm install
 * npm run watch
 * ```
 *
 * To edit config, see `stagehand.config.ts`
 */

import { Page, BrowserContext, Stagehand } from "@/dist";
import { z } from "zod";
import chalk from "chalk";
import dotenv from "dotenv";

dotenv.config();

// Utility functions
async function drawObserveOverlay(page: Page, results: any[]) {
  // Placeholder for overlay drawing
  console.log(chalk.gray("Drawing overlay for results..."));
}

async function clearOverlays(page: Page) {
  // Placeholder for clearing overlays
  console.log(chalk.gray("Clearing overlays..."));
}

export async function main({
  page,
  context,
  stagehand,
}: {
  page: Page;
  context: BrowserContext;
  stagehand: Stagehand;
}) {
  async function actWithCache(instruction: string) {
    const results = await page.observe({
      instruction,
      onlyVisible: false,
      returnAction: true,
    });
    console.log(chalk.blue("Got results:"), results);

    const actionToCache = results[0];
    console.log(chalk.blue("Taking cacheable action:"), actionToCache);

    await drawObserveOverlay(page, results);
    await page.waitForTimeout(1000);
    await clearOverlays(page);

    await page.act(actionToCache);
  }

  // Navigate to the product management subreddit
  await page.goto("https://www.reddit.com/r/productmanagement/");

  // Wait for the content to load
  await page.waitForTimeout(2000);

  // Handle potential cookie consent or popup
  try {
    await actWithCache(
      "Click the 'Reject all' button if there's a cookie popup",
    );
  } catch (error) {
    console.log("No cookie popup found or already handled");
  }

  // Extract posts one at a time to avoid token limits
  const posts = [];
  for (let i = 0; i < 3; i++) {
    const { post } = await page.extract({
      instruction: `Extract the title, score (upvotes), and URL of post number ${
        i + 1
      } from the top of the subreddit`,
      schema: z.object({
        post: z.object({
          title: z.string(),
          score: z.string(),
          url: z.string(),
        }),
      }),
      useTextExtract: false, // Using false since we're extracting small pieces of data
    });
    posts.push(post);
  }

  // Display the results
  console.log(chalk.green("\nTop 3 posts in r/productmanagement:"));
  posts.forEach((post, index) => {
    console.log(chalk.yellow(`\n${index + 1}. ${post.title}`));
    console.log(chalk.blue(`   Upvotes: ${post.score}`));
    console.log(chalk.gray(`   URL: ${post.url}`));
  });
}

// Initialize Stagehand and run the main function
async function example() {
  let stagehand: Stagehand | undefined;
  try {
    stagehand = new Stagehand({
      env: "LOCAL",
      modelName: "gpt-4o",
      verbose: 1,
    });

    await stagehand.init();

    await main({
      page: stagehand.page,
      context: stagehand.context,
      stagehand: stagehand,
    });
  } catch (error) {
    console.error(chalk.red("Error in example:"), error);
  } finally {
    if (stagehand) {
      await stagehand.close().catch(console.error);
    }
  }
}

(async () => {
  try {
    await example();
  } catch (error) {
    console.error(chalk.red("Unhandled error:"), error);
    process.exit(1);
  }
})();
