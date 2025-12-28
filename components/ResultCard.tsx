
import React, { useState, useEffect, useMemo } from 'react';
import { Category } from '../types';
import { fetchNearbyRestaurants } from '../geminiService';

interface RestaurantInfo {
  name: string;
  address: string;
  rating: number;
  review: string;
  distance: string;
  priceRange: string;
}

interface ResultCardProps {
  category: Category;
  userLocation: any;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onSpinAgain: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  category, 
  isFavorited, 
  onToggleFavorite, 
  onSpinAgain 
}) => {
  const manualAddress = localStorage.getItem('lunchgo_address') || '';
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minRating, setMinRating] = useState<number>(0); // 0 = 全部

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchNearbyRestaurants(category.name, manualAddress);
      setRestaurants(data);
      setIsLoading(false);
    };
    loadData();
  }, [category.name, manualAddress]);

  // 動態過濾並按「評價由高至低」排序
  const processedRestaurants = useMemo(() => {
    return restaurants
      .filter(res => res.rating >= minRating)
      .sort((a, b) => b.rating - a.rating); // 評價由高至低
  }, [restaurants, minRating]);

  const handleOpenMap = (resName: string, resAddress: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${resName} ${resAddress}`)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 mb-10 animate-in fade-in zoom-in duration-500">
      {/* 頂部標題區 */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 flex flex-col items-center text-white relative">
        <button onClick={onToggleFavorite} className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isFavorited ? 'bg-white text-red-500 scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`}>
          {isFavorited ? '❤️' : '🤍'}
        </button>
        <div className="bg-white/20 p-4 rounded-3xl mb-4 backdrop-blur-md text-3xl">🍴</div>
        <h2 className="text-2xl font-black mb-1">今日午餐：{category.name}</h2>
        <p className="text-orange-50 text-[10px] opacity-80 font-bold uppercase tracking-widest text-center">
          在 {manualAddress} 附近
        </p>
      </div>

      <div className="p-6">
        {/* 過濾器控制項 */}
        <div className="flex items-center justify-between mb-6 bg-slate-50 p-1.5 rounded-2xl">
          <span className="text-[10px] font-black text-slate-400 ml-3 uppercase flex flex-col">
            <span>篩選評分</span>
            <span className="text-[8px] opacity-60">(按評價由高至低排序)</span>
          </span>
          <div className="flex gap-1">
            {[0, 4.0, 4.5].map((rate) => (
              <button
                key={rate}
                onClick={() => setMinRating(rate)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  minRating === rate 
                    ? 'bg-white text-orange-600 shadow-sm ring-1 ring-orange-100' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {rate === 0 ? '全部' : `${rate}★ ↑`}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-sm font-black text-slate-400">正在搜尋周邊精選好店...</p>
          </div>
        ) : (
          <div className="space-y-3 min-h-[300px]">
            {processedRestaurants.length > 0 ? (
              processedRestaurants.map((res, i) => (
                <div 
                  key={i} 
                  onClick={() => handleOpenMap(res.name, res.address)}
                  className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.98] animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 group-hover:text-orange-600">{res.name}</h4>
                        <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          {res.priceRange}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <span>📍</span> {res.distance} • {res.address}
                      </p>
                    </div>
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-lg text-[11px] font-black whitespace-nowrap shadow-sm">
                      ★ {res.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 italic bg-slate-50 px-3 py-2 rounded-xl border border-slate-50">
                    “{res.review}”
                  </p>
                </div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <span className="text-4xl opacity-20">🏜️</span>
                <p className="text-sm font-bold text-slate-300">此評分範圍內沒有找到餐廳</p>
                <button onClick={() => setMinRating(0)} className="text-xs font-black text-orange-500 underline">顯示全部</button>
              </div>
            )}
          </div>
        )}

        {/* 底部按鈕 */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button 
            onClick={onSpinAgain} 
            className="py-4 border-2 border-slate-200 text-slate-600 text-sm font-black rounded-2xl hover:bg-slate-50 transition-colors"
          >
            🔄 重新轉動
          </button>
          <button 
            onClick={onToggleFavorite}
            className={`py-4 text-sm font-black rounded-2xl shadow-lg transition-all ${isFavorited ? 'bg-red-500 text-white shadow-red-100' : 'bg-orange-500 text-white shadow-orange-100'}`}
          >
            {isFavorited ? '❤️ 已收藏' : '🔖 收藏類別'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
