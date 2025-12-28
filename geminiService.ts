
import { GoogleGenAI, Type } from "@google/genai";

/**
 * 逆向地理編碼：將經緯度轉為易讀的區域名稱
 */
export const getAreaNameFromCoords = async (lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const prompt = `請根據經緯度 (${lat}, ${lng})，回傳該位置所在的「城市與行政區」或「知名地標名稱」。
    只需回傳純文字，例如：台北市信義區 或 勤美誠品附近。字數控制在 10 字內。`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text?.trim() || "未知區域";
  } catch (error) {
    console.error("Reverse Geocode Error:", error);
    return "定位搜尋中";
  }
};

/**
 * 根據分類與真實座標搜尋 3km 內的餐廳
 */
export const fetchNearbyRestaurants = async (categoryName: string, lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const prompt = `你是一位專業的台壽夥伴午餐顧問。請利用 Google 搜尋，針對座標 (${lat}, ${lng}) 周圍「3 公里」範圍內，搜尋關於「${categoryName}」的餐廳。
    
    【搜尋指令】：
    1. 精選區：找出 2 間評分優質（4.0+）、目前正在營業且網友口碑好的名店。
    2. 備選區：找出 3 間距離座標「最近」的餐廳。注意：備選區不需要考慮評分高低，只要距離近、真實存在且有營業即可，甚至是巷弄小店。
    3. 實時校對：必須利用 Google 搜尋獲取該店最新的「一則網友短評」。
    4. 導航需求：請回傳該店的「完整精確地址」，以便生成地圖導航連結。
    5. 範圍限制：嚴格鎖定在 3 公里內。若該區完全無此類別，請自動擴展至最相近的美食。
    
    【回傳 JSON 格式】：
    [
      {
        "name": "店名",
        "address": "餐廳精確地址",
        "type": "精選" 或 "備選",
        "rating": 數字評分,
        "latestReview": "最新一則短評(15字內)"
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
              type: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              latestReview: { type: Type.STRING },
            },
            required: ["name", "address", "type", "rating", "latestReview"]
          }
        }
      },
    });

    const results = JSON.parse(response.text || "[]");
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return results.map((res: any) => {
      const dynamicMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${res.name} ${res.address}`)}`;
      const match = chunks.find((chunk: any) => 
        chunk.web?.title && (res.name.includes(chunk.web.title) || chunk.web.title.includes(res.name))
      );
      return {
        ...res,
        url: match?.web?.uri || dynamicMapsUrl
      };
    });
  } catch (error) {
    console.error("Fetch Restaurants Error:", error);
    return [];
  }
};
