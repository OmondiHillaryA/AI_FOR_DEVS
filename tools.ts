import { tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";
import { writeFileSync } from "fs";

const excludeFiles = ["dist", "bun.lock"];

const fileChange = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

type FileChange = z.infer<typeof fileChange>;

async function getFileChangesInDirectory({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }

  return diffs;
}

export const getFileChangesInDirectoryTool = tool({
  description: "Gets the code changes made in given directory",
  inputSchema: fileChange,
  execute: getFileChangesInDirectory,
});

const commitMessageSchema = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
  type: z.enum(["feat", "fix", "docs", "style", "refactor", "test", "chore"]).describe("Type of commit"),
});

async function generateCommitMessage({ rootDir, type }: z.infer<typeof commitMessageSchema>) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const files = summary.files.map(f => f.file).join(", ");
  const message = `${type}: ${files.length > 50 ? `update ${summary.files.length} files` : files}`;
  return { message, fileCount: summary.files.length };
}

export const generateCommitMessageTool = tool({
  description: "Generates a conventional commit message based on file changes",
  inputSchema: commitMessageSchema,
  execute: generateCommitMessage,
});

const markdownSchema = z.object({
  title: z.string().describe("Title of the markdown document"),
  content: z.string().describe("Content to write to the markdown file"),
  filePath: z.string().describe("Path where to save the markdown file"),
});

function generateMarkdownFile({ title, content, filePath }: z.infer<typeof markdownSchema>) {
  const markdown = `# ${title}\r\n\r\n${content}\r\n`;
  writeFileSync(filePath, markdown, "utf8");
  return { success: true, path: filePath };
}

export const generateMarkdownFileTool = tool({
  description: "Creates a markdown file with specified title and content",
  inputSchema: markdownSchema,
  execute: generateMarkdownFile,
});