// 06-dev-assistant.js
// Phase 5: 实战 - 打造一个“开发者助手” (Dev Assistant)
// 目标：让 Agent 能够操作本地文件系统，真正协助我们写代码。
// 这就是 OpenClaw 的雏形！

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

dotenv.config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

// 使用 2.0 Flash 模型，速度快且支持 Tool Calling
const model = google('gemini-2.0-flash'); 

// 1. 定义文件系统工具 (File System Tools)
const fsTools = {
  // 列出目录内容
  ls: tool({
    description: 'List files in a directory',
    parameters: z.object({
      dirPath: z.string().describe('The directory path to list (relative to current working directory)'),
    }),
    execute: async ({ dirPath }) => {
      try {
        const safePath = path.resolve(process.cwd(), dirPath); // 安全起见，只允许当前目录
        const files = await fs.readdir(safePath);
        return files.join('\n');
      } catch (error) {
        return `Error listing directory: ${error.message}`;
      }
    },
  }),

  // 读取文件内容
  read: tool({
    description: 'Read the contents of a file',
    parameters: z.object({
      filePath: z.string().describe('The path to the file to read'),
    }),
    execute: async ({ filePath }) => {
      try {
        const safePath = path.resolve(process.cwd(), filePath);
        const content = await fs.readFile(safePath, 'utf-8');
        // 为了防止 Context Window 爆炸，我们截断一下太长的文件
        if (content.length > 5000) {
          return content.slice(0, 5000) + "\n...[Truncated]";
        }
        return content;
      } catch (error) {
        return `Error reading file: ${error.message}`;
      }
    },
  }),
  
  // (可选) 写入文件 - 为了安全先不开放写权限，防止误删代码 😅
};

// 2. 创建交互式 CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🤖 Dev Assistant Online (Type 'exit' to quit)");
console.log("I can list files and read code in this directory.");

async function chat() {
  rl.question('\nYou: ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    try {
      console.log("🤖 Thinking...");
      
      const { text, steps } = await generateText({
        model,
        tools: fsTools,
        maxSteps: 10, // 允许更多步数，让它能先 ls 再 read
        system: `You are a helpful developer assistant running in a Node.js environment.
You have access to the file system via 'ls' and 'read' tools.
Your working directory is: ${process.cwd()}
When asked to analyze code, always read the file content first.
Start by listing files if you are unsure where things are.`,
        prompt: input,
      });

      console.log(`\nAI: ${text}`);

      // 打印工具调用日志，让你看到它干了什么
      if (steps) {
        steps.forEach(step => {
          step.toolCalls.forEach(call => {
            console.log(`   [Tool Call] ${call.toolName}('${JSON.stringify(call.args)}')`);
          });
        });
      }

    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    chat();
  });
}

chat();
