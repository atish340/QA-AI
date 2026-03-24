import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTestCases(issue) {
    const prompt = `
You are a Senior QA Engineer.

Jira Story:
Title: ${issue.summary}
Description: ${issue.description}

Generate test cases:
- Functional
- Edge
- Negative

Return ONLY JSON:
[
  {
    "title": "",
    "steps": ["", ""],
    "expected": "",
    "type": "positive|negative|edge"
  }
]
`;

    const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
}