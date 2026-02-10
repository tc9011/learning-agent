// 02-memory-loop.js
// 目标：手动实现“记忆” (Memory)
// 原理：把之前的对话 (History) 存入数组，每次请求时全部发送。

import OpenAI from 'openai';
import readline from 'readline';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🧠 这里的数组就是 Agent 的“短期记忆” (Context Window)
const history = [
  { role: 'system', content: '你是一个名叫 Jarvis 的 AI 助手。你说话幽默风趣。' } // System Prompt: 设定人设
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🤖 Jarvis 在线。输入 'exit' 退出。");

function ask() {
  rl.question('\nUser: ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    // 1. 把用户的输入加入记忆
    history.push({ role: 'user', content: input });

    try {
      // 2. 发送 *整个* history 给 LLM
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: history, // <--- 关键点：发送所有历史
      });

      const reply = completion.choices[0].message.content;
      
      // 3. 把 AI 的回答也加入记忆
      history.push({ role: 'assistant', content: reply });

      console.log(`Jarvis: ${reply}`);
      
      // 显示当前的 Token 消耗 (模拟)
      console.log(`(当前 Context 长度: ${history.length} 条消息)`);

    } catch (error) {
      console.error("Error:", error.message);
    }

    ask(); // 继续下一轮对话
  });
}

ask();
