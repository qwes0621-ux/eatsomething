
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * 根據使用者抽中的類別，搜尋附近 5 公里內的具體餐廳，並提供深度推薦資訊
 */
export const getNearbyRecommendation = async (categoryName: string, lat: number, lng: number) => {
  try {
    const prompt = `你是一位專業的午餐顧問，正在為「台灣人壽（台壽）」的夥伴推薦午餐。
    請在我的位置附近 5 公里內，推薦 3 間真實存在且評價優良的「${categoryName}」類別餐廳。
    
    【輸出規範】：請嚴格依照以下結構輸出，每間餐廳之間用 "---" 分隔：
    
    ### [店名]
    價位：[$, $$, 或 $$$]
    簡介：[限 20 字以內，描述特色]
    熱評：
    - [最新評論1]
    - [最新評論2]
    - [最新評論3]
    ---
    
    【指令要求】：
    - 「簡介」絕對不能超過 20 個繁體中文字。
    - 「熱評」請擷取 Google Maps 上的真實評論重點。
    - 確保推薦的店家地點正確且適合商務夥伴用餐。`;

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
    
    // 提取地圖連結與名稱對應
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
 * AI 智能個人化推薦（基於歷史紀錄）
 */
export const getAIRecommendation = async (history: string[]) => {
  try {
    const historyText = history.length > 0 ? `夥伴最近吃了：${history.join('、')}` : "夥伴目前沒有紀錄。";
    const categoriesList = CATEGORIES.map(c => c.name).join('、');

    const prompt = `你是專門為「台壽夥伴」服務的專業午餐顧問。根據夥伴的歷史紀錄，從以下類別中推薦今天的午餐：${categoriesList}。
    ${historyText}
    請從列表中選出一個類別，並提供充滿活力的推薦理由，以及建議的三個具體餐點。`;

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
