import dotenv from "dotenv";
import OpenAI from "openai";

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

Generate high-quality test cases.

STRICT RULES:
- ONLY return valid JSON
- DO NOT include "json" word
- DO NOT wrap in backticks
- DO NOT add explanation
- RETURN ONLY ARRAY

FORMAT:
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
        temperature: 0.2,
    });

    let content = response.choices[0].message.content.trim();

    // 🔥 CLEAN RESPONSE (handles ```json blocks)
    content = content
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

    let parsed;

    try {
        parsed = JSON.parse(content);
    } catch (err) {
        console.log("⚠️ JSON parse failed");
        console.log("Raw Output:\n", content);
        throw new Error("Failed to parse test cases JSON");
    }

    // 🔥 HANDLE BOTH FORMATS
    if (Array.isArray(parsed)) {
        return parsed;
    }

    if (parsed.testCases) {
        return parsed.testCases;
    }

    throw new Error("Invalid JSON format from AI");
}