import axios from "axios";

export async function createJiraTestCases(issueKey, testCases) {
    const url = `${process.env.JIRA_BASE_URL}/rest/api/3/issue`;

    for (const tc of testCases.testCases || []) {
        const payload = {
            fields: {
                project: {
                    key: issueKey.split("-")[0],
                },
                summary: `[TC] ${tc.title}`,
                description: formatDescription(tc),
                issuetype: {
                    name: "Task"
                }
            }
        };

        try {
            const res = await axios.post(url, payload, {
                auth: {
                    username: process.env.JIRA_EMAIL,
                    password: process.env.JIRA_API_TOKEN,
                },
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            console.log(`✅ Created: ${res.data.key}`);
        } catch (err) {
            console.error("❌ Jira Create Error:", err.response?.data || err.message);
        }
    }
}

function formatDescription(tc) {
    return `
Type: ${tc.type}

Steps:
${(tc.steps || []).map((s, i) => `${i + 1}. ${s}`).join("\n")}

Expected:
${tc.expected}
`;
}