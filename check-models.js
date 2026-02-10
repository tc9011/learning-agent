import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  console.log("🔍 Checking available models...");
  const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using a known good baseline to fetch list
  
  // Actually, listModels is a method on the client, let's try to access it if exposed, 
  // or just try 'gemini-pro' which is the safest GA model.
  
  console.log("🤖 Trying 'gemini-pro' (The stable GA model)...");
  const stableModel = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const result = await stableModel.generateContent("Hello, are you there?");
    const response = await result.response;
    console.log("✅ Success! 'gemini-pro' is working.");
    console.log("Response:", response.text());
  } catch (error) {
    console.error("❌ Error with gemini-pro:", error.message);
  }
}

main();
