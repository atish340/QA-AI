import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTestCases(issue) {
    const start = Date.now();

    try {
        const response = await client.responses.create({
            model: "gpt-4.1-mini",

            input: [
                {
                    role: "system",
                    content:
                        "You are a senior QA engineer. Always return strictly valid JSON following the provided schema.",
                },
                {
                    role: "user",
                    content: `
Generate test cases for this Jira story:

Title: ${issue.summary}
Description: ${issue.description}
`,
                },
            ],

            text: {
                format: {
                    type: "json_schema",
                    name: "test_cases",
                    schema: {
                        type: "object",
                        properties: {
                            testCases: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string" },
                                        steps: {
                                            type: "array",
                                            items: { type: "string" },
                                        },
                                        expected: { type: "string" },
                                        type: {
                                            type: "string",
                                            enum: ["positive", "negative", "edge"],
                                        },
                                    },
                                    required: ["title", "steps", "expected", "type"],
                                    additionalProperties: false,
                                },
                            },
                        },
                        required: ["testCases"],
                        additionalProperties: false,
                    },
                },
            },
        });

        console.log(`⏱️ API Time: ${Date.now() - start} ms`);

        const testCases = extractTestCases(response);

        if (!testCases || !Array.isArray(testCases)) {
            throw new Error("Invalid test case format after extraction");
        }

        console.log(`✅ Extracted ${testCases.length} test cases`);

        return testCases;
    } catch (error) {
        console.error("❌ AI Error:", error.message);
        throw error;
    }
}

/**
 * 🔥 UNIVERSAL PARSER
 */
function extractTestCases(response) {
    let raw =
        response.output_text ||
        response.output?.[0]?.content?.[0]?.text ||
        "";

    if (!raw) {
        throw new Error("Empty AI response");
    }

    // ✅ 1.  proper JSON
    try {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) return parsed;
        if (parsed.testCases) return parsed.testCases;
    } catch (e) {
        // continue
    }

    // ✅ 2.  fixing JSON
    try {
        const fixed = raw
            .replace(/(\w+):/g, '"$1":') // quote keys
            .replace(/'/g, '"') // single → double
            .replace(/\n/g, " ");

        const parsed = JSON.parse(fixed);

        if (Array.isArray(parsed)) return parsed;
        if (parsed.testCases) return parsed.testCases;
    } catch (e) {
        // continue
    }

    // ✅ 3. FINAL: evaluate JS object 
    try {
        const evaluated = new Function(`return ${raw}`)();

        if (Array.isArray(evaluated)) return evaluated;
        if (evaluated.testCases) return evaluated.testCases;
    } catch (e) {
        console.error("❌ FINAL PARSE FAILED");
        console.log("RAW OUTPUT:\n", raw);
        throw new Error("Failed to parse AI response");
    }

    throw new Error("No test cases found");
}