// 01-hello-world-gemini.js
// 目标：理解 LLM 的无状态 (Stateless) 特性 (Gemini Edition)
// 每次调用 API 都是一次全新的开始，它不记得之前的对话。

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  console.log("🤖 正在向 Gemini (gemini-1.5-flash) 发送请求...");

  // 获取模型实例
  // 如果遇到 429 Too Many Requests，请尝试使用 gemini-1.5-flash 或 gemini-1.5-pro
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 第一次请求：打个招呼
  const prompt1 = "你好！我是汤诚。";
  const result1 = await model.generateContent(prompt1);
  const response1 = await result1.response;
  const text1 = response1.text();

  console.log(`\nUser: ${prompt1}\nAI: ${text1}`);

  // 第二次请求：试图引用上下文 (将会失败)
  // 因为这是全新的生成请求，没有带上历史记录
  console.log("\n🤖 发送第二个请求 (不带历史记录)...");
  
  const prompt2 = "我的名字是什么？";
  const result2 = await model.generateContent(prompt2);
  const response2 = await result2.response;
  const text2 = response2.text();

  console.log(`\nUser: ${prompt2}\nAI: ${text2}`);
  
  console.log("\n💡 结论：LLM (Gemini) 本身没有记忆。如果不把它之前的回答重新发给它，它就不知道我是谁。");
}

main();
