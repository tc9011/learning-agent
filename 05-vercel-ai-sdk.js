// 05-vercel-ai-sdk.js
// 目标：使用 Vercel AI SDK 构建 Agent
// Phase 1-3 我们都是手写 Loop 和 API 调用，现在我们要用工业界最流行的框架。
// Vercel AI SDK 极大简化了 Tool Calling 和 Streaming 的处理。

import { createGoogleGenerativeAI } from '@ai-sdk/google'; // 使用 createGoogleGenerativeAI 才能传参
import { generateText, tool } from 'ai';
import { z } from 'zod'; // 用于定义 Tool Schema
import dotenv from 'dotenv';
dotenv.config();

// Vercel SDK 的 Google Provider 比较特殊
// 默认导出 `google` 只是一个 helper，需要 createGoogleGenerativeAI 才能配置 apiKey
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

// 使用 gemini-1.5-pro-latest 或者 gemini-1.5-flash-latest
// 注意：Gemini 的 Tool Calling 在某些旧模型或 Flash Lite 上可能表现不佳，
// 甚至在 args 传递上出现 undefined。我们尝试换一个更强的模型别名。
const model = google('gemini-1.5-flash-latest'); 

async function main() {
  console.log("🤖 使用 Vercel AI SDK (Core) 启动 Agent...");

  // 1. 定义工具 (Tools)
  // Vercel SDK 使用 Zod 来定义参数类型，非常适合 TypeScript/Node.js 开发
  const weatherTool = tool({
    description: 'Get the weather in a location',
    parameters: z.object({
      location: z.string().describe('The location to get the weather for'),
    }),
    execute: async ({ location }) => {
      // 防止 undefined，给一个默认值
      const loc = location || "Unknown";
      console.log(`[Tool] Fetching weather for ${loc}...`);
      // 模拟 API 返回
      const mockDB = {
        "Shanghai": "Sunny, 25°C",
        "Beijing": "Cloudy, 18°C",
        "London": "Rainy, 12°C"
      };
      return mockDB[location] || "Unknown weather.";
    },
  });

  // 2. 调用 generateText (AI SDK Core 的核心)
  // maxSteps: 5 允许模型自动进行多轮思考和工具调用
  // 比如先查上海，再查北京，最后对比，这可能需要多次 Tool Calls
  const { text, steps } = await generateText({
    model, 
    tools: {
      weather: weatherTool,
    },
    maxSteps: 5, // 允许最多 5 轮自动交互
    prompt: '上海和北京现在的天气分别怎么样？请对比一下。',
  });

  // 3. 输出结果
  console.log(`\nUser: 上海和北京现在的天气分别怎么样？请对比一下。`);
  console.log(`AI: ${text}`);
  
  // 还可以查看详细的步骤 (SDK 把中间过程都记录下来了)
  console.log("\n[Debug] Execution Steps:");
  if (steps) {
    for (const step of steps) {
      if (step.toolCalls && step.toolCalls.length > 0) {
        step.toolCalls.forEach(call => {
          console.log(`  - Called tool: ${call.toolName} with args: ${JSON.stringify(call.args)}`);
        });
      }
    }
  }
}

main();
