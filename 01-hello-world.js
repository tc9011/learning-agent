// 01-hello-world.js
// 目标：理解 LLM 的无状态 (Stateless) 特性
// 每次调用 API 都是一次全新的开始，它不记得之前的对话。

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 需要在这个目录下创建一个 .env 文件放入 key
  // 或者直接在这里填入 'sk-...' (不推荐)
});

async function main() {
  console.log("🤖 正在向 LLM 发送请求...");

  // 第一次请求：打个招呼
  const completion1 = await client.chat.completions.create({
    model: 'gpt-4o-mini', // 或者 'gpt-3.5-turbo'
    messages: [
      { role: 'user', content: '你好！我是汤诚。' }
    ],
  });

  const reply1 = completion1.choices[0].message.content;
  console.log(`\nUser: 你好！我是汤诚。\nAI: ${reply1}`);

  // 第二次请求：试图引用上下文 (将会失败)
  // 因为我们没有把之前的 history 发送回去
  console.log("\n🤖 发送第二个请求 (不带历史记录)...");
  
  const completion2 = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: '我的名字是什么？' } // LLM 会很困惑
    ],
  });

  const reply2 = completion2.choices[0].message.content;
  console.log(`\nUser: 我的名字是什么？\nAI: ${reply2}`);
  
  console.log("\n💡 结论：LLM 本身没有记忆。如果我们不把 '你好我是汤诚' 这句话再发一遍，它就不知道我是谁。");
}

main();
