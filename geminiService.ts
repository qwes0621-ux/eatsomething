
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * 根據類別搜尋 10 間餐廳：3 間精選（含評論）+ 7 間備選（高評價清單）
 */
export const getNearbyRecommendation = async (categoryName: string, lat: number, lng: number) => {
  try {
    const prompt = `你是一位專業的午餐顧問，正在為「台灣人壽（台壽）」的夥伴推薦午餐。
    請在我的位置附近 5 公里內，推薦 10 間真實存在的「${categoryName}」類別餐廳。
    
    【輸出規範】：請嚴格依照以下結構輸出：
    
    ===精選推薦===
    ### [店名]
    價位：[$, $$, 或 $$$]
    簡介：[限 20 字以內，描述特色]
    熱評：
    - [最新評論1]
    - [最新評論2]
    - [最新評論3]
    --- (每間精選以此分隔)
    
    ===備選名單===
    * [店名] | 價位：[$, $$, 或 $$$] | 評價：[例如 4.5]
    (列出 7 間高評價備選店家)
    
    【重要指令】：
    - 精選餐廳的「簡介」絕對不能超過 20 個繁體中文字。
    - 確保所有推薦的店家皆真實存在且能透過 Google Maps 找到。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // 提取地圖連結
    const links = chunks
      .filter((chunk: any) => chunk.maps?.uri)
      .map((chunk: any) => ({
        title: chunk.maps.title,
        uri: chunk.maps.uri
      }));

    return {
      text,
      links
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return null;
  }
};

/**
 * AI 智能個人化推薦
 */
export const getAIRecommendation = async (history: string[]) => {
  try {
    const historyText = history.length > 0 ? `夥伴最近吃了：${history.join('、')}` : "夥伴目前沒有紀錄。";
    const categoriesList = CATEGORIES.map(c => c.name).join('、');

    const prompt = `你是專門為「台壽夥伴」服務的專業午餐顧問。根據夥伴的歷史紀錄，從以下類別中推薦今天的午餐：${categoriesList}。
    ${historyText}
    請選出一個類別並提供推薦理由及三個具體餐點。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedCategory: { type: Type.STRING },
            reason: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['recommendedCategory', 'reason', 'suggestions']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return null;
  }
};
