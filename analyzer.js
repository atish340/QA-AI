import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeStory(issue) {
    const prompt = `
You are a Senior QA Analyst with strong product understanding.

Analyze the Jira story deeply before creating test cases.

Jira Story:
Title: ${issue.summary}
Description: ${issue.description}

Think like a QA and extract the following:

1. User Intent → What is the user trying to achieve?
2. User Roles → Who will use this feature?
3. Core Functionalities → Main flows of the feature
4. Business Rules → Important conditions/logic
5. Validation Points → Field validations, required checks
6. Possible Risks → What can break in production
7. Edge Cases → Boundary and unusual scenarios
8. Negative Scenarios → Invalid inputs and failure cases
9. Dependencies → APIs, DB, third-party services

IMPORTANT:
- Be specific and realistic
- Avoid generic statements
- Think like testing a real product

Return STRICT JSON ONLY:

{
  "intent": "",
  "userRoles": [],
  "functionalities": [],
  "businessRules": [],
  "validations": [],
  "risks": [],
  "edgeCases": [],
  "negativeScenarios": [],
  "dependencies": []
}
`;

    const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
    });

    try {
        return JSON.parse(res.choices[0].message.content);
    } catch (e) {
        console.log("⚠️ Analyzer JSON parse failed, returning raw output");
        return res.choices[0].message.content;
    }
}