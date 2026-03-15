// 05-agent-framework.js
// Phase 4: Agent 框架化
// 目标：使用现代 AI SDK 风格接口简化 Tool Calling 和 ReAct Loop。

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, tool, stepCountIs, zodSchema } from 'ai';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

// 1. 初始化 Google Provider
// 需要显式传递 apiKey，因为默认环境变量名不匹配
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

// 使用支持 Tool Calling 的 Gemini 模型
const model = google('gemini-3-flash-preview');

async function main() {
  console.log("🤖 启动 Agent Framework Demo (Model: gemini-3-flash-preview)...");

  // 2. 定义工具 (Tools)
  const weatherTool = tool({
    description: 'Get the weather in a location',
    // AI SDK 6 + Gemini 下显式转成 JSON Schema 更稳，否则工具参数定义可能丢失
    inputSchema: zodSchema(z.object({
      location: z.string().describe('The location to get the weather for'),
    })),
    execute: async ({ location }) => {
      const loc = location || 'Unknown';
      console.log(`[Tool] Fetching weather for ${loc}...`);

      const mockDB = {
        '上海': '晴天，25°C',
        '北京': '多云，18°C',
        'Shanghai': 'Sunny, 25°C',
        'Beijing': 'Cloudy, 18°C',
        'London': 'Rainy, 12°C'
      };

      return {
        location: loc,
        weather: mockDB[loc] || 'Unknown weather.',
      };
    },
  });

  try {
    // 3. 核心调用：generateText
    // AI SDK 6 使用 stopWhen 控制多步工具调用
    const { text, steps } = await generateText({
      model,
      tools: {
        weather: weatherTool,
      },
      // System Prompt 对引导某些模型使用工具非常重要
      system: 'You are a helpful assistant. You have access to weather data via the `weather` tool. Use it whenever asked about weather, then answer in Chinese.',
      stopWhen: stepCountIs(5), // 最多允许 5 步自动交互 (ReAct Loop)
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
            console.log(`  - Called tool: ${call.toolName} with input: ${JSON.stringify(call.input)}`);
          });
        }
      }
    }
  } catch (error) {
    console.error("❌ Execution Error:", error);
  }
}

main();
