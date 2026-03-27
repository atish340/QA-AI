import axios from "axios";

export async function createJiraTestCases(issueKey, testCases) {
    const createUrl = `${process.env.JIRA_BASE_URL}/rest/api/3/issue`;
    const linkUrl = `${process.env.JIRA_BASE_URL}/rest/api/3/issueLink`;

    for (const tc of testCases || []) {
        const payload = {
            fields: {
                project: {
                    key: issueKey.split("-")[0],
                },

                summary: `[TC] ${tc.title || "No Title"}`,

                description: formatDescriptionADF(tc),

                // ✅ VALID ISSUE TYPE 
                issuetype: {
                    name: "Test Case",
                },

                labels: ["AI-Generated", "TestCase"],
            },
        };

        try {
            // 🔹 CREATE TEST CASE
            const res = await axios.post(createUrl, payload, {
                auth: {
                    username: process.env.JIRA_EMAIL,
                    password: process.env.JIRA_API_TOKEN,
                },
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            const testCaseKey = res.data.key;
            console.log(`✅ Created: ${testCaseKey}`);

            // 🔗 LINK TO STORY
            await linkIssues(issueKey, testCaseKey, linkUrl);

        } catch (err) {
            console.error(
                "❌ Jira Create Error:",
                err.response?.data || err.message
            );
        }
    }
}

// 🔗 LINK FUNCTION 
async function linkIssues(storyKey, testCaseKey, linkUrl) {
    try {
        const payload = {
            type: {
                name: "Relates", // ✅ relates to
            },
            inwardIssue: {
                key: testCaseKey,
            },
            outwardIssue: {
                key: storyKey,
            },
        };

        await axios.post(linkUrl, payload, {
            auth: {
                username: process.env.JIRA_EMAIL,
                password: process.env.JIRA_API_TOKEN,
            },
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        console.log(`🔗 Linked ${testCaseKey} → ${storyKey}`);
    } catch (err) {
        console.error(
            "❌ Link Error:",
            err.response?.data || err.message
        );
    }
}

// 🧠 FORMAT DESCRIPTION 
function formatDescriptionADF(tc) {
    return {
        type: "doc",
        version: 1,
        content: [
            {
                type: "heading",
                attrs: { level: 3 },
                content: [{ type: "text", text: "Test Case Details" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: `Type: ${tc.type || "N/A"}` },
                ],
            },
            {
                type: "heading",
                attrs: { level: 4 },
                content: [{ type: "text", text: "Steps" }],
            },

            // ✅ STEPS HANDLING
            ...((tc.steps || ["No steps provided"]).map((step, i) => ({
                type: "paragraph",
                content: [
                    { type: "text", text: `${i + 1}. ${step}` },
                ],
            }))),

            {
                type: "heading",
                attrs: { level: 4 },
                content: [{ type: "text", text: "Expected Result" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: tc.expected || "N/A" },
                ],
            },
        ],
    };
}