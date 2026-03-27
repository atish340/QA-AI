import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeStory(issue) {
    const start = Date.now();

    const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            {
                role: "system",
                content: "You are a senior QA analyst. Always return valid structured JSON."
            },
            {
                role: "user",
                content: `
Analyze this Jira story:

Title: ${issue.summary}
Description: ${issue.description}

Extract:
- intent
- userRoles
- functionalities
- businessRules
- validations
- risks
- edgeCases
- negativeScenarios
- dependencies
`
            }
        ],

        // 🔥  STRUCTURED OUTPUT 
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "analysis",
                schema: {
                    type: "object",
                    properties: {
                        intent: { type: "string" },
                        userRoles: {
                            type: "array",
                            items: { type: "string" }
                        },
                        functionalities: {
                            type: "array",
                            items: { type: "string" }
                        },
                        businessRules: {
                            type: "array",
                            items: { type: "string" }
                        },
                        validations: {
                            type: "array",
                            items: { type: "string" }
                        },
                        risks: {
                            type: "array",
                            items: { type: "string" }
                        },
                        edgeCases: {
                            type: "array",
                            items: { type: "string" }
                        },
                        negativeScenarios: {
                            type: "array",
                            items: { type: "string" }
                        },
                        dependencies: {
                            type: "array",
                            items: { type: "string" }
                        }
                    },
                    required: [
                        "intent",
                        "userRoles",
                        "functionalities",
                        "businessRules",
                        "validations",
                        "risks",
                        "edgeCases",
                        "negativeScenarios",
                        "dependencies"
                    ],
                    additionalProperties: false
                }
            }
        },

        temperature: 0.2,
    });

    console.log(`⏱️ Analyzer API Time: ${Date.now() - start} ms`);

    // ✅  VALID JSON
    return response.choices[0].message.parsed;
}