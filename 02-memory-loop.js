// 02-memory-loop-gemini.js
// 目标：手动实现“记忆” (Memory)
// 原理：使用 GoogleGenerativeAI 的 `startChat` 模式
// 它会帮我们把 history 维护在内存里 (类似我们手动 push array)

import { GoogleGenerativeAI } from '@google/generative-ai';
import readline from 'readline';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🧠 Gemini SDK 提供了 `startChat`，简化了手动维护数组的过程
// 但底层逻辑是一样的：每次发送 prompt 时，其实都在带上之前的所有历史。
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });

const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "System: 你是一个名叫 Jarvis 的 AI 助手。你说话幽默风趣。" }],
    },
    {
      role: "model",
      parts: [{ text: "Jarvis: 明白了，我会尽力做一个有趣又靠谱的管家。" }],
    },
  ],
  generationConfig: {
    maxOutputTokens: 1000,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🤖 Jarvis (Gemini) 在线。输入 'exit' 退出。");

function ask() {
  rl.question('\nUser: ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    try {
      // 发送消息，chat 对象会自动 append history
      const result = await chat.sendMessage(input);
      const response = await result.response;
      const text = response.text();
      
      console.log(`Jarvis: ${text}`);

      // 我们可以看看现在的 history 有多长
      // (Gemini SDK 把这部分藏起来了，但在实际 API call 里，它还是要把全量 token 发过去)
      // 注意：Gemini 的 Context Window 很大 (1M+ tokens)，比 OpenAI 更耐造
    } catch (error) {
      console.error("Error:", error.message);
    }

    ask(); // 继续下一轮对话
  });
}

ask();
