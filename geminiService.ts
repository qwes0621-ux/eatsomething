
import { GoogleGenAI } from "@google/genai";

export interface RestaurantInfo {
  name: string;
  address: string;
  rating: number;
  review: string;
  distance: string;
  priceRange: string;
  priceLevel: number; // 1:$, 2:$$, 3:$$$, 4:$$$$
  openingHours: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

/**
 * 根據手動輸入地址與分類搜尋周邊餐廳數據，使用 Google Maps Grounding
 */
export const fetchNearbyRestaurants = async (categoryName: string, address: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `請搜尋位於『${address}』附近的『${categoryName}』相關餐廳。
    
    【核心要求】：
    1. 務必提供精確 6 間真實存在的店家。
    2. 無視評分高低。
    3. 無視價位高低，但請提供價位等級供排序。
    4. 若該特定分類店家不足 6 間，請自動擴大範圍搜尋相似的料理種類，務必填滿 6 個名額。
    
    請直接回傳一個包含 6 個物件的 JSON 陣列，放在 Markdown 的 JSON 代碼塊中。
    JSON 格式要求如下：
    [
      {
        "name": "店名",
        "address": "地址",
        "rating": 數字評分,
        "review": "一則簡短評論(15字內)",
        "distance": "預估步行時間或距離",
        "priceRange": "價位區間字串(如: 100-200元)",
        "priceLevel": 數字等級(1-4),
        "openingHours": "營業時間(如: 11:00-20:00 或 營業中)"
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || "";
    
    // 從 Markdown 中提取 JSON 區塊
    let restaurants: RestaurantInfo[] = [];
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        restaurants = JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error("JSON Parse Error:", e);
      }
    } else {
      try {
        const potentialJson = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
        restaurants = JSON.parse(potentialJson);
      } catch (e) {
        console.error("Fallback JSON Parse Error:", e);
      }
    }

    // 提取 Grounding Sources
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          sources.push({
            title: chunk.maps.title,
            uri: chunk.maps.uri
          });
        }
      });
    }

    return { 
      restaurants: restaurants.length > 0 ? restaurants : [], 
      sources 
    };
  } catch (error) {
    console.error("Search API Error:", error);
    return { restaurants: [], sources: [] };
  }
};
