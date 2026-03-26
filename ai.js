import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTestCases(issue, analysis) {
    if (!issue.description) {
        issue.description = "No description provided";
    }

    const prompt = `
You are a Senior QA Engineer.

Use the analysis below to generate high-quality test cases.

Analysis:
${JSON.stringify(analysis, null, 2)}

Instructions:
- Cover Functional, Negative, Edge, Validation
- Be realistic and specific
- Avoid generic cases

Return JSON:

{
  "testCases": [
    {
      "id": "TC-01",
      "type": "Functional | Negative | Edge | Validation",
      "title": "",
      "preconditions": "",
      "steps": ["", ""],
      "expectedResult": ""
    }
  ]
}
`;

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1500,
    });

    try {
        return JSON.parse(response.choices[0].message.content);
    } catch {
        console.log("⚠️ JSON parse failed");
        return response.choices[0].message.content;
    }
}