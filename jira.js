import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function getJiraIssue(issueKey) {
    try {
        console.log("Fetching Jira issue...");

        const auth = Buffer.from(
            `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
        ).toString("base64");

        // 🔍 Check API user
        const me = await axios.get(
            `${process.env.JIRA_BASE_URL}/rest/api/3/myself`,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    Accept: "application/json",
                },
            }
        );

        console.log("API USER:", me.data.emailAddress);

        // 🎯 Fetch Issue
        const url = `${process.env.JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`;

        const response = await axios.get(url, {
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: "application/json",
            },
        });

        return {
            title: response.data.fields.summary,
            description: response.data.fields.description,
        };
    } catch (error) {
        console.error(
            "Jira API Error:",
            error.response?.data || error.message
        );
        throw error;
    }
}