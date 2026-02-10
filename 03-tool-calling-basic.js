// 03-tool-calling-basic.js
// 目标：让 AI 调用函数 (Function Calling)
// 这是 Agent 能够与外部世界交互的基础。

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. 定义我们的工具函数 (真正的逻辑)
const tools = {
  // 模拟一个天气查询 API
  getWeather: ({ city }) => {
    console.log(`[System] 正在查询 ${city} 的天气...`);
    const weatherData = {
      "Shanghai": "Sunny, 25°C",
      "Beijing": "Cloudy, 18°C",
      "London": "Rainy, 12°C"
    };
    return weatherData[city] || "Unknown weather data for this city.";
  },
  
  // 模拟一个简单的计算器
  add: ({ a, b }) => {
    console.log(`[System] 计算 ${a} + ${b}...`);
    return a + b;
  }
};

// 2. 定义工具的 Schema (告诉 LLM 这些工具长什么样)
// Gemini 使用标准的 OpenAPI Schema 格式
const toolsSchema = [
  {
    functionDeclarations: [
      {
        name: "getWeather",
        description: "Get the current weather in a given city.",
        parameters: {
          type: "OBJECT",
          properties: {
            city: {
              type: "STRING",
              description: "The city name, e.g. 'Shanghai', 'New York'",
            },
          },
          required: ["city"],
        },
      },
      {
        name: "add",
        description: "Add two numbers together.",
        parameters: {
          type: "OBJECT",
          properties: {
            a: { type: "NUMBER", description: "First number" },
            b: { type: "NUMBER", description: "Second number" },
          },
          required: ["a", "b"],
        },
      },
    ],
  },
];

async function main() {
  // 3. 初始化带有工具的模型
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest", // 还是用这个最稳的模型
    tools: toolsSchema,
  });

  const chat = model.startChat();

  console.log("🤖 Agent with Tools 在线。");
  console.log("试试问它：'上海今天天气怎么样？' 或者 '33 加 44 等于多少？'\n");

  // 4. 发送一个 Query
  const prompt = "上海今天天气怎么样？";
  console.log(`User: ${prompt}`);

  const result = await chat.sendMessage(prompt);
  const response = result.response;
  
  // 5. 检查 LLM 是否想要调用工具
  // Gemini 的 response.functionCalls() 会返回调用请求
  const functionCalls = response.functionCalls();

  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    const { name, args } = call;
    console.log(`\n👉 LLM 决定调用工具: ${name}(${JSON.stringify(args)})`);

    // 6. 执行工具代码
    const toolResult = tools[name](args);
    console.log(`✅ 工具执行结果: ${toolResult}`);

    // 7. 把结果喂回给 LLM (这一步很关键)
    // 我们必须告诉 LLM: "你刚才调用的 get_weather 结果是 'Sunny, 25°C'"
    const result2 = await chat.sendMessage([
      {
        functionResponse: {
          name: name,
          response: { result: toolResult } // 格式必须是 { result: ... }
        }
      }
    ]);
    
    // 8. 获取最终的自然语言回答
    console.log(`\nAI: ${result2.response.text()}`);
  } else {
    // 如果 LLM 不需要调用工具，直接打印回答
    console.log(`\nAI: ${response.text()}`);
  }
}

main();
