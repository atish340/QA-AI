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
        const analysis = await analyzeStory(issue);

        console.log("✅ Analysis Done");

        console.log("\n🧪 Generating test cases...");
        const testCasesRaw = await generateTestCases(issue, analysis);

        // IMPORTANT: parse AI response
        let testCases;
        try {
            testCases = JSON.parse(testCasesRaw);
        } catch (e) {
            console.error("❌ Failed to parse test cases JSON");
            console.log("Raw Output:\n", testCasesRaw);
            return;
        }

        console.log(`✅ Generated ${testCases.length} test cases`);

        console.log("\n📤 Creating test cases in Jira...");

        await createJiraTestCases(issue.key, {
            testCases: testCases
        });

        console.log("\n🎉 DONE! Test cases created in Jira");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

run();