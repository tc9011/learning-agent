// 05-vercel-ai-sdk.js
// Phase 4: 使用 Vercel AI SDK 构建 Agent
// 目标：使用现代框架简化 Tool Calling 和 ReAct Loop。

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

// 1. 初始化 Google Provider
// 需要显式传递 apiKey，因为默认环境变量名不匹配
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

// 使用 gemini-2.0-flash (Preview 模型支持 Tool Calling)
const model = google('gemini-2.0-flash'); 

async function main() {
  console.log("🤖 启动 Vercel AI SDK Agent (Model: gemini-2.0-flash)...");

  // 2. 定义工具 (Tools)
  const weatherTool = tool({
    description: 'Get the weather in a location',
    parameters: z.object({
      location: z.string().describe('The location to get the weather for'),
    }),
    execute: async ({ location }) => {
      // 防御性处理：有些模型可能传空值
      const loc = location || "Unknown";
      console.log(`[Tool] Fetching weather for ${loc}...`);
      
      const mockDB = {
        "Shanghai": "Sunny, 25°C",
        "Beijing": "Cloudy, 18°C",
        "London": "Rainy, 12°C"
      };
      return mockDB[loc] || "Unknown weather.";
    },
  });

  try {
    // 3. 核心调用：generateText
    // SDK 会自动处理多轮工具调用 (maxSteps)
    const { text, steps } = await generateText({
      model, 
      tools: {
        weather: weatherTool,
      },
      // System Prompt 对引导某些模型使用工具非常重要
      system: 'You are a helpful assistant. You have access to weather data via the `weather` tool. Use it whenever asked about weather.',
      maxSteps: 5, // 允许最多 5 步自动交互 (ReAct Loop)
      prompt: '上海和北京现在的天气分别怎么样？请对比一下。',
    });

    // 4. 输出结果
    console.log(`\nUser: 上海和北京现在的天气分别怎么样？请对比一下。`);
    console.log(`AI: ${text}`);
    
    // 5. 查看执行步骤 (Debug)
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
  } catch (error) {
    console.error("❌ Execution Error:", error);
  }
}

main();
