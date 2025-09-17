import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./prompts";
import { getFileChangesInDirectoryTool, generateCommitMessageTool, generateMarkdownFileTool, codeQualityMetricsTool } from "./tools";

const codeReviewAgent = async (prompt : string) => {
    const result = streamText({
        model: google("models/gemini-2.5-flash"),
        prompt,
        system: SYSTEM_PROMPT,
        tools: {
            getFileChangesInDirectoryTool,
            generateCommitMessageTool,
            generateMarkdownFileTool,
            codeQualityMetricsTool,
        },
        stopWhen: stepCountIs(10),
    });

    for await (const chunk of result.textStream) {
        process.stdout.write(chunk);
    }
};

    // Specify which directory the code review agent should review changes in your prompt
    await codeReviewAgent(
        "Analyze the code quality metrics for './src/metrics/calculator.ts' file and provide detailed feedback",
    );