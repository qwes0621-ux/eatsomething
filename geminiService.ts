
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * 根據使用者抽中的類別，搜尋附近 5 公里內的具體餐廳，並提供深度推薦資訊
 */
export const getNearbyRecommendation = async (categoryName: string, lat: number, lng: number) => {
  try {
    const prompt = `你是一位專業的午餐顧問，正在為「台灣人壽（台壽）」的夥伴推薦午餐。
    請在我的位置附近 5 公里內，推薦 3 間屬於「${categoryName}」類別的餐廳。
    
    【重要指令】：
    - 若附近優質店家較少，請務必擴大範圍並推薦評價較普通但距離可接受的店家作為備案，不可回傳空結果。
    - 對於每間餐廳，請務必提供：
      1. 餐廳名稱與完整地址。
      2. 綜合評分與評價內容（即使評價較低也請註明其特色）。
      3. 深度推薦說明（價格水平、CP 值、星座喜愛）。
      4. 【外送資訊分析】：請分析這家店大約多少錢可以外送（根據外送平台慣例或該店規則估計起送金額與運費）。
    
    請以條列格式回答，口吻親切且貼近辦公室夥伴需求。`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
 * AI 智能個人化推薦（基於歷史紀錄）
 */
export const getAIRecommendation = async (history: string[]) => {
  try {
    const historyText = history.length > 0 ? `夥伴最近吃了：${history.join('、')}` : "夥伴目前沒有紀錄。";
    const categoriesList = CATEGORIES.map(c => c.name).join('、');

    const prompt = `你是專門為「台壽夥伴」服務的專業午餐顧問。根據夥伴的歷史紀錄，從以下類別中推薦今天的午餐：${categoriesList}。
    ${historyText}
    請從列表中選出一個類別，並提供充滿活力的推薦理由（例如：吃點好的補充能量，下午會議更有精神！），以及建議的三個具體餐點。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedCategory: { type: Type.STRING, description: '推薦的午餐類別名稱' },
            reason: { type: Type.STRING, description: '推薦原因' },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '三個建議的具體餐點'
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
