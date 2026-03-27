import dotenv from "dotenv";
import { getJiraIssue } from "./jira.js";
import { analyzeStory } from "./analyzer.js";
import { generateTestCases } from "./ai.js";
import { createJiraTestCases } from "./jiracreate.js";

dotenv.config();

const issueKey = process.argv[2];

if (!issueKey) {
    console.error("❌ Please provide Jira Issue Key (e.g. AS-288)");
    process.exit(1);
}

async function run() {
    try {
        console.log("🔍 Fetching Jira issue...");
        const issue = await getJiraIssue(issueKey);

        console.log(`📌 Issue: ${issue.summary}`);

        console.log("\n🧠 Analyzing story...");
        await analyzeStory(issue); // optional 

        console.log("✅ Analysis Done");

        console.log("\n🧪 Generating test cases...");

        // ✅RETURNS ARRAY
        const testCases = await generateTestCases(issue);

        console.log(`✅ Generated ${testCases.length} test cases`);

        console.log("\n📤 Creating test cases in Jira...");

        // ✅ PASS ARRAY 
        await createJiraTestCases(issue.key, testCases);

        console.log("\n🎉 DONE! Test cases created in Jira");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

run();