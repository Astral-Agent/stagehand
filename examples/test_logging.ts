import { Stagehand } from "../lib";

async function testLogging() {
  // Test with verbose: 0 (should show no DOM logs)
  console.log("\n=== Testing with verbose: 0 (should show NO DOM logs) ===");
  const stagehand = new Stagehand({
    env: "LOCAL",
    verbose: 1,
    debugDom: false,
  });

  try {
    console.log("Starting test...");
    await stagehand.init();

    console.log("Going to blank page...");
    try {
      await stagehand.page.goto("https://www.reddit.com/", {
        waitUntil: "domcontentloaded",
      });
    } catch (error) {
      console.error("Error navigating to page:", error);
      throw error;
    }

    console.log("\nPerforming actions (should NOT see DOM logs):");
    try {
      console.log("1. Looking for any elements...");
      await stagehand.page.observe("Find any elements on the page");
    } catch (error) {
      console.error("Error during observe:", error);
      throw error;
    }
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await stagehand.close();
  }
}

(async () => {
  try {
    await testLogging();
  } catch (error) {
    console.error("Test failed:", error);
  }
  process.exit(0);
})();
