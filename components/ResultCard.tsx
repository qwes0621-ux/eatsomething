
import React, { useMemo, useState } from 'react';
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
  const [filterHighRating, setFilterHighRating] = useState(false);
  const [showAllAlternatives, setShowAllAlternatives] = useState(false);

  // 隨機選出三個契合星座
  const randomZodiacs = useMemo(() => {
    const shuffled = [...ZODIAC_SIGNS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [category.id]);

  // 解析推薦資訊 (解析 10 間)
  const allRestaurants = useMemo(() => {
    if (!aiData?.text) return [];
    
    const sections = aiData.text.split('---').filter(s => s.trim().includes('###'));
    
    return sections.map(section => {
      const nameMatch = section.match(/###\s*(.*)/);
      const typeMatch = section.match(/類型：\s*(.*)/);
      const ratingMatch = section.match(/星級：\s*([\d.]+)/);
      const priceMatch = section.match(/價位：\s*(.*)/);
      const descMatch = section.match(/簡介：\s*(.*)/);
      const reviewsMatch = section.match(/-\s*(.*)/g);
      
      const name = nameMatch ? nameMatch[1].trim() : "未知店家";
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
      const type = typeMatch ? typeMatch[1].trim() : "精選";
      const mapLink = aiData.links.find(l => l.title.includes(name) || name.includes(l.title));

      let description = descMatch ? descMatch[1].trim() : "";
      if (description.length > 20) description = description.slice(0, 20) + "...";

      return {
        name,
        type,
        rating,
        price: priceMatch ? priceMatch[1].trim() : "$",
        description,
        reviews: reviewsMatch ? reviewsMatch.slice(0, 3).map(r => r.replace('-', '').trim()) : [],
        url: mapLink?.uri || `https://www.google.com/maps/search/${encodeURIComponent(name)}`
      };
    });
  }, [aiData]);

  // 根據篩選條件過濾
  const filtered = useMemo(() => {
    return filterHighRating ? allRestaurants.filter(res => res.rating >= 4.0) : allRestaurants;
  }, [allRestaurants, filterHighRating]);

  // 分成精選與備選
  const featured = useMemo(() => filtered.slice(0, 3), [filtered]);
  const alternatives = useMemo(() => filtered.slice(3, 10), [filtered]);

  return (
    <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 mb-10 animate-in fade-in zoom-in duration-500">
      {/* 頂部 Header */}
      <div className="bg-gradient-to-br from-orange-400 to-red-500 p-8 flex flex-col items-center text-white relative">
        <button 
          onClick={onToggleFavorite}
          className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isFavorited ? 'bg-white text-red-500 scale-110' : 'bg-white/20 text-white'}`}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
        <div className="bg-white/20 p-4 rounded-3xl mb-4 backdrop-blur-md">
          <span className="text-4xl">✨</span>
        </div>
        <h2 className="text-3xl font-black mb-1">中獎：{category.name}</h2>
        <p className="text-orange-50 text-[12px] opacity-90 font-bold uppercase tracking-widest">Tailored for TL Partners</p>
      </div>

      <div className="p-6">
        {/* 契合星座 */}
        <div className="mb-8 flex flex-col items-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> 今日契合星座
          </p>
          <div className="flex gap-2">
            {randomZodiacs.map(sign => (
              <span key={sign} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[11px] font-black border border-slate-100 shadow-sm">
                {sign}
              </span>
            ))}
          </div>
        </div>

        {/* 推薦列表與篩選器 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
              🏅 精選推薦 (3間)
            </h3>
            
            {/* 篩選開關 */}
            {!isLoading && allRestaurants.length > 0 && (
              <button 
                onClick={() => setFilterHighRating(!filterHighRating)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black transition-all border ${
                  filterHighRating 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100' 
                    : 'bg-white text-gray-400 border-gray-200 hover:border-orange-200'
                }`}
              >
                {filterHighRating ? '🏅 已過濾 4.0+' : '🏅 篩選 4.0+'}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 text-xs font-bold">搜尋 10 間精選餐廳中...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 精選區域 */}
              <div className="space-y-5">
                {featured.length > 0 ? (
                  featured.map((res, idx) => (
                    <div key={`feat-${idx}`} className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-100 rounded-[32px] p-5 shadow-sm group animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-lg font-black text-slate-800 hover:text-blue-600 transition-colors">
                            {res.name}
                          </a>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-yellow-500 text-xs">⭐</span>
                            <span className="text-slate-500 text-[11px] font-black">{res.rating}</span>
                          </div>
                        </div>
                        <span className="text-orange-600 font-black text-sm px-2 py-0.5 bg-orange-100 rounded-lg">{res.price}</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl mb-4 border border-slate-50 shadow-sm">
                        <p className="text-slate-600 text-[13px] font-bold leading-relaxed">💡 {res.description}</p>
                      </div>
                      <div className="space-y-2 mb-4">
                        {res.reviews.map((rev, ridx) => (
                          <div key={ridx} className="flex gap-2 text-[11px] text-slate-500 font-medium">
                            <span className="flex-none text-blue-400 font-black">“</span>
                            <p className="italic leading-snug">{rev}</p>
                          </div>
                        ))}
                      </div>
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-blue-600 text-white text-[13px] font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all">
                        🗺️ 前往 Google 地圖
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400 text-xs font-bold bg-gray-50 rounded-2xl">暫無符合條件的精選餐廳</div>
                )}
              </div>

              {/* 備選區域 */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h3 className="text-base font-black text-gray-400 flex items-center gap-2 mb-4">
                  🥈 備選清單 (7間)
                </h3>
                {alternatives.length > 0 ? (
                  <div className="space-y-2">
                    {alternatives.map((res, idx) => (
                      <div key={`alt-${idx}`} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-orange-200 transition-colors group">
                        <div className="flex flex-col overflow-hidden">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-700 truncate text-sm">{res.name}</h4>
                            <span className="text-[10px] font-black text-yellow-600">★{res.rating}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{res.description}</p>
                        </div>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex-none w-8 h-8 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all">
                          🗺️
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-xs font-bold bg-gray-50 rounded-2xl">暫無符合條件的備選餐廳</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="mt-10 grid grid-cols-2 gap-3">
          <button 
            onClick={onSpinAgain}
            className="py-4 border-2 border-slate-200 text-slate-600 text-sm font-black rounded-2xl hover:bg-slate-50 active:scale-95 transition"
          >
            沒胃口，再轉！
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
