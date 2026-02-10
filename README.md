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

## Phase 4: Frameworks (Vercel AI SDK)

*   `05-vercel-ai-sdk.js`: Implementing an Agent using the modern Vercel AI SDK (Core).
    *   **Goal**: Simplify Tool Calling and ReAct loops using a standardized framework.
    *   **Key Feature**: `maxSteps` allows the model to automatically perform multiple tool calls (Round-trips) to solve complex queries without manual loops.
    *   **Tech Stack**: Vercel AI SDK, Zod (for type-safe schemas).

## Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`.
3.  Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
4.  Run the examples: `node 05-vercel-ai-sdk.js`.

## Troubleshooting

If you encounter `429 Too Many Requests` or `404 Not Found` with the Gemini API:
*   The code is configured to use `gemini-flash-latest` (a stable alias).
*   If that fails, run `node list-models.js` to see which models are available for your API key, and update the model name in the scripts.
