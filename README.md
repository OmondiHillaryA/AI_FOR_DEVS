# AI Code Review Agent

An intelligent code review agent powered by Google's Gemini AI that analyzes git changes, generates commit messages, and creates documentation.

## Features

- **Code Review**: Analyzes git diffs and provides detailed code review feedback
- **Commit Message Generation**: Creates conventional commit messages based on file changes
- **Markdown Generation**: Generates documentation files with specified content

## Setup

1. Install dependencies:
```bash
bun install
```

2. Set your Google AI API key:
```bash
set GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Usage

Run the agent:
```bash
bun run start
```

The agent will review code changes in the current directory and provide feedback.

## Tools

- `getFileChangesInDirectoryTool`: Analyzes git diffs in a directory
- `generateCommitMessageTool`: Creates conventional commit messages
- `generateMarkdownFileTool`: Generates markdown documentation files