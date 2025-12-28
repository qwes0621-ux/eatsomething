
import React, { useMemo, useState, useEffect } from 'react';
import { Category } from '../types';
import { ZODIAC_SIGNS } from '../constants';
import { fetchNearbyRestaurants } from '../geminiService';

interface RestaurantInfo {
  name: string;
  address: string;
  type: '精選' | '備選';
  rating: number;
  latestReview: string;
  url: string;
}

interface ResultCardProps {
  category: Category;
  userLocation: { lat: number, lng: number } | null;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onSpinAgain: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  category, 
  userLocation,
  isFavorited, 
  onToggleFavorite, 
  onSpinAgain 
}) => {
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [minRating, setMinRating] = useState<number>(4.0);

  const ratingOptions = [3.5, 4.0, 4.5];

  useEffect(() => {
    const loadRestaurants = async () => {
      if (!userLocation) return;
      setIsLoading(true);
      const data = await fetchNearbyRestaurants(category.name, userLocation.lat, userLocation.lng);
      setRestaurants(data || []);
      setIsLoading(false);
    };
    loadRestaurants();
  }, [category.name, userLocation]);

  const featured = useMemo(() => {
    return restaurants.filter(r => (r.type === '精選' || r.type.includes('精')) && r.rating >= minRating);
  }, [restaurants, minRating]);

  const backups = useMemo(() => {
    return restaurants.filter(r => r.type === '備選' || r.type.includes('備'));
  }, [restaurants]);

  return (
    <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 mb-10 animate-in fade-in zoom-in duration-500">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 flex flex-col items-center text-white relative">
        <button onClick={onToggleFavorite} className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isFavorited ? 'bg-white text-red-500 scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`}>
          {isFavorited ? '❤️' : '🤍'}
        </button>
        <div className="bg-white/20 p-4 rounded-3xl mb-4 backdrop-blur-md">
          <span className="text-4xl">🚀</span>
        </div>
        <h2 className="text-3xl font-black mb-1">今日推薦：{category.name}</h2>
        <p className="text-orange-50 text-[11px] opacity-90 font-bold uppercase tracking-widest text-center">
          AI 已聯網搜尋方圓 3KM 內店家
        </p>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-gray-800 font-black">AI 正在導航 3KM 內名店...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-orange-600 flex items-center gap-2">🏆 評價精選 (3KM)</h3>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {ratingOptions.map((rate) => (
                    <button key={rate} onClick={() => setMinRating(rate)} className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${minRating === rate ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}>
                      {rate}★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {featured.length > 0 ? featured.map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="group block bg-white border border-orange-100 rounded-2xl p-4 hover:bg-orange-50/50 transition-all shadow-sm active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-black text-slate-800 group-hover:text-orange-600 transition-colors">{res.name}</h4>
                      <span className="bg-orange-500 px-2 py-0.5 rounded-lg text-[11px] font-black text-white">★ {res.rating}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2 truncate">📍 {res.address}</p>
                    <div className="bg-slate-50 p-2 rounded-xl italic">
                      <p className="text-[11px] text-slate-500 font-bold leading-relaxed flex gap-2">
                        “{res.latestReview}”
                      </p>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-[9px] font-black text-orange-500">直接導航 ➔</span>
                    </div>
                  </a>
                ) : (
                  <p className="text-center py-4 text-xs text-slate-400 font-medium italic border border-dashed rounded-xl">3KM 內暫無高評分店家，請參考下方鄰近建議</p>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-black text-slate-400 flex items-center gap-2">📍 距離最近建議 (不限評分)</h3>
              <div className="grid gap-2">
                {backups.map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-1 hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-black text-slate-700 truncate">{res.name}</p>
                      <span className="text-[10px] font-bold text-slate-300">★ {res.rating}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic truncate">最新：{res.latestReview}</p>
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4">
          <button onClick={onSpinAgain} className="py-4 border-2 border-slate-200 text-slate-600 text-sm font-black rounded-2xl hover:bg-slate-50 transition-colors">🔄 回首頁</button>
          <button onClick={onToggleFavorite} className={`py-4 text-sm font-black rounded-2xl shadow-lg transition-all ${isFavorited ? 'bg-red-500 text-white shadow-red-100' : 'bg-orange-500 text-white shadow-orange-100'}`}>
            {isFavorited ? '❤️ 已收藏' : '🔖 收藏這類'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
