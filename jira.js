import axios from "axios";

function extractText(description) {
    if (!description || !description.content) return "No description";

    return description.content
        .map(block =>
            block.content?.map(c => c.text).join(" ")
        )
        .join("\n");
}

export async function getJiraIssue(issueKey) {
    const url = `${process.env.JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`;

    try {
        const response = await axios.get(url, {
            auth: {
                username: process.env.JIRA_EMAIL,
                password: process.env.JIRA_API_TOKEN,
            },
            headers: {
                Accept: "application/json",
            },
        });

        const fields = response.data.fields;

        return {
            key: issueKey,
            summary: fields.summary,
            description: extractText(fields.description),
            issueType: fields.issuetype?.name,
            status: fields.status?.name,
            priority: fields.priority?.name,
        };

    } catch (error) {
        console.error("Jira API Error:", error.response?.data || error.message);
        throw error;
    }
}