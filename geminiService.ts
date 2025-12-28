
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES } from "./constants";

/**
 * 根據使用者抽中的類別，搜尋附近 5 公里內的具體餐廳
 * 要求總共 10 間：3 精選 + 7 備選
 */
export const getNearbyRecommendation = async (categoryName: string, lat: number, lng: number) => {
  try {
    // 每次呼叫時初始化，使用 process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const prompt = `你是一位專為「台壽夥伴（台灣人壽）」服務的專業午餐顧問。
    請在夥伴位置附近 5 公里內，推薦 10 間真實存在的「${categoryName}」餐廳。
    
    【分配比例】：
    - 前 3 間為「精選推薦」（最推薦、品質最高）。
    - 後 7 間為「備選名單」（不錯的替代方案）。

    【輸出格式規範】：請務必依照以下範例結構輸出，每間餐廳間用 "---" 分隔：
    
    ### [店名]
    類型：[精選 或 備選]
    星級：[數字，例如 4.2]
    價位：[$, $$, 或 $$$]
    簡介：[限 20 字以內，描述該店最吸引人的特色]
    評論：
    - [最新評論重點1]
    - [最新評論重點2]
    - [最新評論重點3]
    ---
    
    【關鍵指令】：
    - 總共必須列出 10 間，不得少於 10 間。
    - 星級請提供 Google Maps 上的真實平均分數。
    - 簡介部分「絕對不得超過 20 個繁體中文字」。
    - 使用 googleMaps 工具搜尋目前營業中且真實的地點。`;

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
    const links = chunks
      .filter((chunk: any) => chunk.maps?.uri)
      .map((chunk: any) => ({
        title: chunk.maps.title,
        uri: chunk.maps.uri
      }));

    return { text, links };
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
    // 每次呼叫時初始化
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const historyText = history.length > 0 ? `台壽夥伴最近吃了：${history.join('、')}` : "夥伴尚無紀錄。";
    const categoriesList = CATEGORIES.map(c => c.name).join('、');

    const prompt = `你是專為「台壽夥伴」設計的專業午餐顧問。根據夥伴歷史紀錄推薦一個類別：${categoriesList}。
    ${historyText}
    請選出一個類別，並提供充滿活力且體恤夥伴辛苦的推薦理由與建議的三個菜點。`;

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
