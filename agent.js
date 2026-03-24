import { getJiraIssue } from "./jira.js";
import { generateTestCases } from "./ai.js";

const issueKey = process.argv[2];

if (!issueKey) {
    console.log("Please provide Jira ID");
    process.exit(1);
}

async function run() {
    try {
        console.log("Fetching Jira issue...");

        const issue = await getJiraIssue(issueKey);

        console.log("Generating test cases...");

        const testCases = await generateTestCases(issue);

        console.log("\n=== AI OUTPUT ===\n");
        console.log(testCases);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();