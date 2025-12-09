
import { Type, Schema } from "@google/genai";
import { FortuneResult, UserData } from "../types";
import { ZODIAC_DATA } from "./zodiacData";

// Safely retrieve API Key with better fallback and validation
const getApiKey = () => {
  let key = "";
  
  // 1. Try standard Vite environment variable (Recommended for Vercel/Vite)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    key = import.meta.env.VITE_API_KEY;
  }
  // 2. Try standard process.env (Fallback for Node/Runtime)
  else if (typeof process !== 'undefined' && process.env) {
    key = process.env.API_KEY || process.env.VITE_API_KEY || "";
  }

  return key;
};

// Configuration
const apiKey = getApiKey();
const BASE_URL = "https://shell.wyzai.top/v1";

// Schema for structured JSON output
const fortuneSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overview: {
      type: Type.STRING,
      description: "A comprehensive yearly overview. MUST combine '整体运程', '财运', '事业', '感情', '健康' sections from the source text using markdown headers.",
    },
    monthly: {
      type: Type.ARRAY,
      description: "A breakdown of fortune for each month of 2026.",
      items: {
        type: Type.OBJECT,
        properties: {
          month: { type: Type.INTEGER, description: "The month number (1-12)" },
          title: { type: Type.STRING, description: "A short 4-character idiom or title for the month based on content." },
          solarDateRange: { type: Type.STRING, description: "The Gregorian date range for this lunar month (e.g., '2月17日 - 3月18日')." },
          content: { type: Type.STRING, description: "Detailed prediction for this month directly from the source text." },
          score: { type: Type.INTEGER, description: "Luck score from 1 to 5." },
        },
        required: ["month", "title", "solarDateRange", "content", "score"],
      },
    },
    products: {
      type: Type.ARRAY,
      description: "Recommended Feng Shui products based on the '吉祥物' section.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the product in Chinese." },
          type: { type: Type.STRING, description: "Material type (Crystal, Amber, Gold, etc)." },
          description: { type: Type.STRING, description: "Keep this empty." },
          reason: { type: Type.STRING, description: "Concise reason based on the text." },
        },
        required: ["name", "type", "description", "reason"],
      },
    },
  },
  required: ["overview", "monthly", "products"],
};

// Simple Zodiac Calculator based on standard Feb 4th cutoff (Li Chun)
const getZodiacSign = (dobString: string): string => {
  const date = new Date(dobString);
  let year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // If before Feb 4th, it counts as the previous year for Zodiac purposes
  if (month < 2 || (month === 2 && day < 4)) {
    year = year - 1;
  }

  // Standard cycle: Rat(4), Ox(5), Tiger(6), Rabbit(7), Dragon(8), Snake(9), Horse(10), Goat(11), Monkey(0), Rooster(1), Dog(2), Pig(3)
  const zodiacs = [
    "Monkey", "Rooster", "Dog", "Pig",
    "Rat", "Ox", "Tiger", "Rabbit",
    "Dragon", "Snake", "Horse", "Goat"
  ];
  
  return zodiacs[year % 12];
};

export const analyzeFortune = async (
  userData: UserData
): Promise<FortuneResult> => {
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_API_KEY in your environment variables.");
  }

  const zodiac = getZodiacSign(userData.dob);
  const zodiacContent = ZODIAC_DATA[zodiac];

  if (!zodiacContent) {
    throw new Error(`Zodiac content not found for ${zodiac}`);
  }

  const prompt = `
    You are an AI data parser acting as Master Song Shao Guang's digital assistant.
    
    **TASK**: 
    I will provide you with the raw text content for the **${zodiac}** Zodiac sign from Master Song's "2026 Horse Year Almanac".
    Your job is to **PARSE** this text into the specified JSON format.
    
    **RULES**:
    1. **NO FABRICATION**: You must ONLY use the information provided in the source text below. Do not add external knowledge.
    2. **NO SUMMARIZATION**: Preserve the full detail of the predictions.
    3. **Overview Field**: 
       - Combine the sections: 【整体运程】, 【财运】, 【事业】, 【感情】, 【健康】.
       - Use Markdown headers (e.g. ### 整体运程) to separate them within the single string.
    4. **Monthly Field**:
       - Map the text for "农历正月" to month 1, "农历二月" to month 2, etc.
       - Ensure the \`solarDateRange\` accurately matches the text provided (e.g. "西历 2026 年 2 月 4 日至 3 月 4 日").
    5. **Products Field**:
       - Look for the section "趋吉避凶的吉祥物".
       - Extract the specific item mentioned (e.g., "生肖狗吊坠", "三合太岁挂件").
       - If only one is listed, repeat it or split its description to fill the array, but prioritize accuracy.
    6. **Language**: Output MUST be in Traditional Chinese (繁体中文) or Simplified Chinese (简体中文) exactly as it appears in the source text.

    **SOURCE TEXT FOR ${zodiac} (DO NOT DEVIATE)**:
    """
    ${zodiacContent}
    """
  `;

  try {
    // Manually construct the fetch request to ensure compatibility with the proxy
    // Proxies usually map /v1 to the Google API root, so we append /models/{model}:generateContent
    const url = `${BASE_URL}/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'x-goog-api-key': apiKey // Some proxies prefer header, some query param. Using both or query param is safer.
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: fortuneSchema,
        }
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText, "Status:", response.status);
        // Throw a specific error to be caught by the UI
        throw new Error(`Request failed (${response.status}): ${errorText.slice(0, 100)}...`);
    }

    const data = await response.json();
    
    // Safety check for response structure
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        console.error("Unexpected API response structure:", data);
        throw new Error("No content generated from API.");
    }
    
    return JSON.parse(text) as FortuneResult;
  } catch (error) {
    console.error("Fortune analysis failed:", error);
    throw error;
  }
};
