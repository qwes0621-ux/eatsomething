
import React, { useMemo } from 'react';
import { Category } from '../types';
import { ZODIAC_SIGNS } from '../constants';

interface ResultCardProps {
  category: Category;
  aiData: {
    text: string;
    links: Array<{ title: string; uri: string }>;
  } | null;
  isLoading: boolean;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onSpinAgain: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  category, 
  aiData, 
  isLoading, 
  isFavorited, 
  onToggleFavorite, 
  onSpinAgain 
}) => {
  // 隨機選出三個契合星座
  const randomZodiacs = useMemo(() => {
    const shuffled = [...ZODIAC_SIGNS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [category.id]);

  // 解析 AI 文字為結構化資料
  const restaurants = useMemo(() => {
    if (!aiData?.text) return [];
    
    const sections = aiData.text.split('---').filter(s => s.trim().includes('###'));
    
    return sections.map(section => {
      const nameMatch = section.match(/###\s*(.*)/);
      const priceMatch = section.match(/價位：\s*(.*)/);
      const descMatch = section.match(/簡介：\s*(.*)/);
      const reviewsMatch = section.match(/-\s*(.*)/g);
      
      const name = nameMatch ? nameMatch[1].trim() : "未知店家";
      // 尋找對應的地圖連結
      const mapLink = aiData.links.find(l => l.title.includes(name) || name.includes(l.title));

      return {
        name,
        price: priceMatch ? priceMatch[1].trim() : "$",
        description: descMatch ? descMatch[1].trim() : "",
        reviews: reviewsMatch ? reviewsMatch.slice(0, 3).map(r => r.replace('-', '').trim()) : [],
        url: mapLink?.uri || `https://www.google.com/maps/search/${encodeURIComponent(name)}`
      };
    });
  }, [aiData]);

  return (
    <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-gray-100 mb-10">
      {/* 頂部裝飾區 */}
      <div className="bg-gradient-to-br from-orange-400 to-red-500 p-8 flex flex-col items-center text-white relative">
        <button 
          onClick={onToggleFavorite}
          className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isFavorited ? 'bg-white text-red-500 scale-110' : 'bg-white/20 text-white'}`}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
        <div className="bg-white/20 p-3 rounded-2xl mb-4 backdrop-blur-md">
          <span className="text-3xl">🎉</span>
        </div>
        <h2 className="text-3xl font-black mb-1">今天吃：{category.name}</h2>
        <p className="text-orange-50 text-center text-[12px] opacity-90 font-medium">台壽夥伴專屬推薦，5km 內最優選</p>
      </div>

      <div className="p-6">
        {/* 契合星座 - 趣味元素 */}
        <div className="mb-6 flex flex-col items-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">🍀 今日契合星座</p>
          <div className="flex gap-2">
            {randomZodiacs.map(sign => (
              <span key={sign} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[11px] font-bold border border-slate-100 shadow-sm">
                {sign}
              </span>
            ))}
          </div>
        </div>

        {/* 餐廳推薦列表 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📍</span>
            <h3 className="text-base font-black text-gray-800">精選夥伴口袋名單</h3>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 text-xs font-bold">正在連線 Google Maps...</p>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="space-y-4">
              {restaurants.map((res, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-2">
                    <a 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg font-black text-gray-800 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      {res.name} <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                    </a>
                    <span className="text-orange-500 font-black text-sm bg-orange-50 px-2 py-0.5 rounded-lg">{res.price}</span>
                  </div>
                  
                  {res.description && (
                    <p className="text-gray-600 text-[13px] leading-relaxed mb-4 font-medium">
                      ✨ {res.description}
                    </p>
                  )}

                  <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">夥伴真心熱評</p>
                    {res.reviews.map((rev, ridx) => (
                      <div key={ridx} className="flex gap-2 text-[11px] text-gray-500 leading-snug">
                        <span className="text-orange-300">💬</span>
                        <p className="italic">{rev}</p>
                      </div>
                    ))}
                  </div>

                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-2.5 bg-blue-50 text-blue-600 text-xs font-black rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    🗺️ 開啟 Google 地圖導航
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-3xl text-gray-400 text-xs font-bold">
              暫時找不到附近的建議店家，請稍後再試。
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button 
            onClick={onSpinAgain}
            className="py-4 border-2 border-orange-500 text-orange-500 text-sm font-black rounded-2xl hover:bg-orange-50 active:scale-95 transition"
          >
            換個口味
          </button>
          <button 
            onClick={onToggleFavorite}
            className={`py-4 text-sm font-black rounded-2xl shadow-lg active:scale-95 transition ${isFavorited ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}
          >
            {isFavorited ? '❤️ 已收藏' : '收藏類別'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
