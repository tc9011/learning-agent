// list-models.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// 如果没有 Key，直接报错
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is missing in .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  console.log("🔍 Fetching available models for your API Key...");
  
  // 这是一个未公开但在 SDK 中可用的方法，或者我们可以直接调 REST API
  // 这里我们尝试直接用 fetch 调用，绕过 SDK 的某些封装，看最原始的返回
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("❌ API Error:", JSON.stringify(data.error, null, 2));
      return;
    }

    if (!data.models) {
      console.log("⚠️ No models found.");
      return;
    }

    console.log(`✅ Found ${data.models.length} models:`);
    const chatModels = data.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name.replace("models/", ""));

    const embedModels = data.models
      .filter(m => m.supportedGenerationMethods.includes("embedContent"))
      .map(m => m.name.replace("models/", ""));

    console.log("\n--- Chat Models ---");
    chatModels.forEach(name => console.log(`- ${name}`));

    console.log("\n--- Embedding Models ---");
    embedModels.forEach(name => console.log(`- ${name}`));

  } catch (error) {
    console.error("❌ Network Error:", error.message);
  }
}

main();
