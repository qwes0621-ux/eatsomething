
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
  // 隨機契合星座
  const randomZodiacs = useMemo(() => {
    const shuffled = [...ZODIAC_SIGNS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [category.id]);

  // 解析 3 精選 + 7 備選
  const parsedData = useMemo(() => {
    if (!aiData?.text) return { featured: [], alternatives: [] };

    const text = aiData.text;
    const featuredPart = text.split('===備選名單===')[0] || '';
    const altPart = text.split('===備選名單===')[1] || '';

    // 解析精選
    const featuredSections = featuredPart.split('---').filter(s => s.trim().includes('###'));
    const featured = featuredSections.map(section => {
      const nameMatch = section.match(/###\s*(.*)/);
      const priceMatch = section.match(/價位：\s*(.*)/);
      const descMatch = section.match(/簡介：\s*(.*)/);
      const reviewsMatch = section.match(/-\s*(.*)/g);
      const name = nameMatch ? nameMatch[1].trim() : "未知店家";
      const mapLink = aiData.links.find(l => l.title.includes(name) || name.includes(l.title));
      
      return {
        name,
        price: priceMatch ? priceMatch[1].trim() : "$",
        description: descMatch ? descMatch[1].trim() : "美味值得一試",
        reviews: reviewsMatch ? reviewsMatch.slice(0, 3).map(r => r.replace('-', '').trim()) : [],
        url: mapLink?.uri || `https://www.google.com/maps/search/${encodeURIComponent(name)}`
      };
    }).slice(0, 3);

    // 解析備選
    const altLines = altPart.split('\n').filter(l => l.includes('*'));
    const alternatives = altLines.map(line => {
      const cleanLine = line.replace('*', '').trim();
      const parts = cleanLine.split('|').map(p => p.trim());
      const name = parts[0] || "其他好店";
      const price = parts[1] || "";
      const rating = parts[2] || "";
      const mapLink = aiData.links.find(l => l.title.includes(name) || name.includes(l.title));
      
      return { 
        name, 
        price, 
        rating, 
        url: mapLink?.uri || `https://www.google.com/maps/search/${encodeURIComponent(name)}` 
      };
    }).slice(0, 7);

    return { featured, alternatives };
  }, [aiData]);

  return (
    <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-gray-100 mb-10">
      {/* Header */}
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
        <h2 className="text-3xl font-black mb-1">抽中：{category.name}</h2>
        <p className="text-orange-50 text-center text-xs opacity-90 font-medium tracking-wide">台壽夥伴專屬：5km 內 10 間口袋名單</p>
      </div>

      <div className="p-6">
        {/* 星座趣味標籤 */}
        <div className="mb-8 flex flex-col items-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">🍀 今日契合星座</p>
          <div className="flex gap-2">
            {randomZodiacs.map(sign => (
              <span key={sign} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[11px] font-bold border border-orange-100">
                {sign}
              </span>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm font-bold animate-pulse">正在精選 10 間在地美味...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 精選推薦 Top 3 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏆</span>
                <h3 className="text-lg font-black text-gray-800">精選前三名</h3>
              </div>
              <div className="space-y-4">
                {parsedData.featured.map((res, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-[30px] p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-2">
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-lg font-black text-gray-800 hover:text-blue-600">
                        {res.name}
                      </a>
                      <span className="text-orange-500 font-black text-xs bg-orange-50 px-2 py-0.5 rounded-lg">{res.price}</span>
                    </div>
                    <p className="text-gray-600 text-[13px] leading-relaxed mb-4 font-medium">✨ {res.description}</p>
                    
                    <div className="space-y-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">夥伴最新評論</p>
                      {res.reviews.map((rev, ridx) => (
                        <div key={ridx} className="flex gap-2 text-[11px] text-gray-500 leading-snug">
                          <span className="text-orange-300 shrink-0">💬</span>
                          <p className="italic line-clamp-2">{rev}</p>
                        </div>
                      ))}
                    </div>
                    
                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-2.5 bg-blue-50 text-blue-600 text-xs font-black rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                      🗺️ 開啟 Google 地圖
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* 備選名單 Next 7 */}
            {parsedData.alternatives.length > 0 && (
              <section className="bg-slate-50 rounded-[35px] p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🍱</span>
                  <h3 className="text-base font-black text-gray-800">在地備選推薦</h3>
                </div>
                <div className="divide-y divide-slate-200">
                  {parsedData.alternatives.map((alt, idx) => (
                    <a 
                      key={idx} 
                      href={alt.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between py-3.5 hover:bg-white/50 rounded-lg px-2 transition-colors group"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 text-[13px] group-hover:text-blue-600">{alt.name}</span>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-orange-400 font-bold">{alt.price}</span>
                          <span className="text-[10px] text-gray-400">{alt.rating}</span>
                        </div>
                      </div>
                      <span className="text-gray-300 text-xs group-hover:text-blue-400">📍</span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-10 grid grid-cols-2 gap-4">
          <button 
            onClick={onSpinAgain}
            className="py-4 border-2 border-orange-500 text-orange-500 text-sm font-black rounded-2xl hover:bg-orange-50 active:scale-95 transition"
          >
            手氣不好，重抽
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
