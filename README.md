# Learning AI Agent Development

This repository contains code examples and exercises for learning AI Agent development, following a structured plan from basics to advanced topics.

## Phase 1: Foundations (Stateless LLM & Context)

*   `01-hello-world.js`: Demonstrates the stateless nature of LLMs. Each API call is independent.
*   `02-memory-loop.js`: Implements a simple chat loop using Gemini's `startChat` feature (which handles context/history).

## Phase 2: Tool Use (Agent Core)

*   `03-tool-calling-basic.js`: A minimal implementation of Function Calling.
    *   **Goal**: Understand that LLMs don't run code; they output JSON instructions.
    *   **Flow**: User Query -> LLM (Think) -> Tool Call Request -> Execution (You) -> Tool Result -> LLM (Final Answer).

## Phase 3: Memory & State (RAG)

*   `04-rag-basic.js`: A minimal implementation of Retrieval-Augmented Generation (RAG).
    *   **Goal**: Allow LLM to access a "Knowledge Base" (simulated local array) using Vector Embeddings.
    *   **Flow**: Knowledge Base -> Embed -> Vector Store. User Query -> Embed -> Find Similarity -> Prompt + Context -> LLM Answer.

## Phase 4: Agent Frameworks

*   `05-agent-framework.js`: Implementing an Agent with a framework-style SDK approach.
    *   **Goal**: Move from hand-written loops to framework-based orchestration for tools and multi-step reasoning.
    *   **Key Feature**: `stopWhen: stepCountIs(...)` allows the model to automatically perform multiple tool calls (Round-trips) without manually writing the loop.
    *   **Tech Stack**: `ai` SDK-style abstractions, Zod schema validation, Google provider.
    *   **Model**: Uses `gemini-3-flash-preview`, with a System Prompt to guide tool usage.

## Phase 5: Dev Assistant (Local File System)

*   `06-dev-assistant.js`: A CLI Dev Assistant that can explore and read local files.
    *   **Goal**: Build a practical agent that interacts with the *real environment* (File System), not just mock data.
    *   **Tools**:
        *   `ls`: List files in the current directory.
        *   `read`: Read file contents for analysis.
    *   **Use Case**: "Explain what this file does", "Check my README", "Find the error in 01-hello-world.js".
    *   **Concept**: This is the prototype of advanced coding agents like OpenClaw/Cursor.

## Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`.
3.  Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
4.  Run the examples: `node 06-dev-assistant.js`.

## Troubleshooting

If you encounter `429 Too Many Requests` or `404 Not Found` with the Gemini API:
*   Some examples are configured to use preview Gemini models (for example `gemini-3-flash-preview`).
*   If that fails, run `node list-models.js` to see which models are available for your API key, and update the model name in the scripts.
*   System Prompts ("You have access to tools...") are crucial for some Gemini models to recognize tool availability.
