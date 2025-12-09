
import { FortuneResult, UserData } from "../types";
import { ZODIAC_DATA } from "./zodiacData";

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

const chineseNumberMap: Record<string, number> = {
  "正": 1, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6,
  "七": 7, "八": 8, "九": 9, "十": 10, "十一": 11, "十二": 12
};

export const analyzeFortune = async (
  userData: UserData
): Promise<FortuneResult> => {
  
  // Simulate a short delay for the "analyzing" UI effect
  await new Promise(resolve => setTimeout(resolve, 800));

  const zodiac = getZodiacSign(userData.dob);
  const rawText = ZODIAC_DATA[zodiac];

  if (!rawText) {
    throw new Error(`Zodiac content not found for ${zodiac}`);
  }

  // --- Local Parsing Logic ---

  // 1. Separate the "Lucky Product" section (usually at the very end)
  // We split by the header "趋吉避凶的吉祥物"
  const productSplit = rawText.split("趋吉避凶的吉祥物");
  let mainContent = rawText;
  let productSection = "";

  if (productSplit.length > 1) {
    mainContent = productSplit[0];
    productSection = productSplit[1].trim();
  }

  // 2. Extract Overview
  // The overview is the text before the first month entry (starts with "农历")
  const firstMonthIndex = mainContent.search(/农历[正一二三四五六七八九十]+月/);
  let overviewText = "";
  
  if (firstMonthIndex !== -1) {
    overviewText = mainContent.substring(0, firstMonthIndex).trim();
  } else {
    overviewText = mainContent.trim();
  }

  // Formatting:
  // Remove the first line (usually "属X的 2026 年运程")
  overviewText = overviewText.replace(/^.*\n/, "");
  // Convert brackets 【Section】 to Markdown headers ### Section
  overviewText = overviewText.replace(/【(.*?)】/g, "\n### $1");


  // 3. Extract Months
  const monthlyData = [];
  // Regex explanation:
  // 农历([number])月 -> Captures month name (Group 1)
  // [（\(](.*?)[）\)] -> Captures date range inside brackets (Group 2)
  // \s*([\s\S]*?) -> Captures content non-greedily (Group 3)
  // (?=农历|$) -> Stop looking when we hit the next "农历" or end of string
  const monthRegex = /农历([正一二三四五六七八九十]+)月[（\(](.*?)[）\)]\s*([\s\S]*?)(?=农历|$)/g;

  let match;
  while ((match = monthRegex.exec(mainContent)) !== null) {
    const cnMonth = match[1];
    const dateRange = match[2];
    const content = match[3].trim();
    const monthNum = chineseNumberMap[cnMonth] || 0;

    // Generate a pseudo-score (3-5) based on content length for visual variety
    const score = (content.length % 3) + 3; 

    monthlyData.push({
      month: monthNum,
      title: "运程详解", // Generic title since we are parsing locally
      solarDateRange: dateRange,
      content: content,
      score: score
    });
  }

  // 4. Extract Products
  const products = [];
  if (productSection) {
    // Try to extract a specific product name using a regex pattern common in the text
    // Example: "可在东南摆放一个[三合太岁挂件]作为..."
    const nameMatch = productSection.match(/摆放(一个|一座)(.*?)(作为|来|之|为)/);
    const productName = nameMatch ? nameMatch[2].trim() : "开运吉祥物";

    products.push({
      name: productName,
      type: "Feng Shui Item", 
      description: "",
      reason: productSection
    });
  } else {
    // Fallback
    products.push({
      name: "生肖护身符",
      type: "General",
      description: "",
      reason: "建议佩戴所属生肖的护身符以保平安。"
    });
  }

  return {
    overview: overviewText.trim(),
    monthly: monthlyData,
    products: products
  };
};
