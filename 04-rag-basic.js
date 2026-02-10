// 04-rag-basic.js
// 目标：实现 RAG (Retrieval-Augmented Generation) - 也就是“长期记忆”
// 原理：
// 1. 知识库 (Knowledge Base): 一堆文本。
// 2. 向量化 (Embedding): 把文本变成数字向量 (Vectors)，语义相似的文本向量距离近。
// 3. 检索 (Retrieval): 用户提问 -> 变成向量 -> 在数据库中找最相似的片段。
// 4. 生成 (Generation): 把找到的片段作为 Context 喂给 LLM。

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. 模拟一个“知识库” (实际上通常存在 Vector DB 里，如 Pinecone/Chroma)
// 这些是 LLM 原生不知道的私有数据
const knowledgeBase = [
  "汤诚 (Theon) 的生日是 1月1日。",
  "汤诚目前在 LEGO 担任 Senior Frontend Engineer。",
  "汤诚最喜欢的歌手是周杰伦。",
  "OpenClaw 是一个基于 Node.js 的 AI Agent 框架。",
  "汤诚的 MBTI 人格是 INTJ (建筑师)。"
];

// 存储向量化的知识库
let vectorStore = [];

// 获取 Embedding 模型 (使用你的 key 支持的唯一 embedding 模型)
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// 计算余弦相似度 (Cosine Similarity)
// 这是一个数学公式，用来判断两个向量有多像 (1 = 完全一样, 0 = 完全无关)
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

async function initKnowledgeBase() {
  console.log("🔄 正在构建向量索引 (Indexing)...");
  
  for (const text of knowledgeBase) {
    const result = await embeddingModel.embedContent(text);
    const vector = result.embedding.values;
    vectorStore.push({ text, vector });
    console.log(`  - Embedded: "${text}"`);
  }
  console.log("✅ 索引构建完成。\n");
}

async function retrieve(query) {
  // 1. 把用户的问题也变成向量
  const result = await embeddingModel.embedContent(query);
  const queryVector = result.embedding.values;

  // 2. 在数据库中寻找最相似的 Top 1
  // (在真实场景中，Vector DB 会用 ANN 算法加速这一步)
  const sorted = vectorStore.map(item => ({
    text: item.text,
    score: cosineSimilarity(queryVector, item.vector)
  })).sort((a, b) => b.score - a.score); // 分数高的排前面

  console.log(`🔍 检索结果 (Query: "${query}"):`);
  console.log(`  - Top Match: "${sorted[0].text}" (Score: ${sorted[0].score.toFixed(4)})`);
  
  // 我们只取最相关的一条作为 Context
  return sorted[0].text;
}

async function ask(question) {
  console.log(`\nUser Question: ${question}`);
  
  // 1. Retrieve: 找相关资料
  const context = await retrieve(question);

  // 2. Augment: 把资料塞进 Prompt
  const prompt = `
  你是一个助手。请根据以下上下文回答用户的问题。
  如果上下文里没有答案，就说不知道，不要瞎编。

  [Context]
  ${context}

  [Question]
  ${question}
  `;

  // 3. Generate: 让 LLM 回答
  const result = await chatModel.generateContent(prompt);
  console.log(`AI Answer: ${result.response.text()}`);
}

async function main() {
  await initKnowledgeBase();

  // 测试 1: 问简历相关
  await ask("汤诚在哪里工作？");

  // 测试 2: 问个人喜好
  await ask("他喜欢听谁的歌？");

  // 测试 3: 问无关问题 (测试 RAG 的边界)
  // 虽然会检索到最接近的（可能并不相关），但 LLM 应该判断出无法回答
  await ask("明天股票会涨吗？");
}

main();
