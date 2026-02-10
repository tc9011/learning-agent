import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

const model = google('gemini-2.0-flash'); 

async function main() {
  console.log("🤖 Using Vercel AI SDK (Core) with gemini-2.0-flash...");

  const weatherTool = tool({
    description: 'Get the weather in a location',
    parameters: z.object({
      location: z.string().describe('The location to get the weather for'),
    }),
    execute: async ({ location }) => { 
      // 还是加一点防御性
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
    const { text, steps } = await generateText({
      model, 
      tools: {
        weather: weatherTool,
      },
      system: 'You are a helpful assistant. You have access to weather data via the `weather` tool. Use it whenever asked about weather.',
      maxSteps: 5,
      prompt: '上海和北京现在的天气分别怎么样？请对比一下。',
    });

    console.log(`\nUser: 上海和北京现在的天气分别怎么样？请对比一下。`);
    console.log(`AI: ${text}`);
    
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