
import { GoogleGenAI, Type } from "@google/genai";

/**
 * 根據手動輸入地址與分類搜尋周邊餐廳數據
 */
export const fetchNearbyRestaurants = async (categoryName: string, address: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `請搜尋位於『${address}』附近的『${categoryName}』餐廳。
    請提供至少 6-8 間真實存在的店家資訊。
    特別注意：請提供每間店的大約『價位區間』（例如：100-200元、300-500元、1000元以上）。
    
    【回傳 JSON 格式】：
    [
      {
        "name": "店名",
        "address": "地址",
        "rating": 數字評分(如 4.2),
        "review": "一則簡短評論(15字內)",
        "distance": "預估步行時間或距離",
        "priceRange": "價位區間字串"
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              review: { type: Type.STRING },
              distance: { type: Type.STRING },
              priceRange: { type: Type.STRING }
            },
            required: ["name", "address", "rating", "review", "distance", "priceRange"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Search API Error:", error);
    return [];
  }
};
