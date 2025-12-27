
import React from 'react';
import { Category } from '../types';

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
  return (
    <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-gray-100 mb-10">
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
        <h2 className="text-3xl font-black mb-2">抽中：{category.name}</h2>
        <p className="text-orange-50 text-center text-sm opacity-90 leading-relaxed">{category.description}</p>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-gray-800 flex items-center">
            <span className="mr-2">🚀</span> 附近 5km 精選推薦
          </h3>
          <span className="text-[10px] px-2 py-1 bg-green-100 text-green-600 rounded-full font-bold">搜尋範圍：5km</span>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-gray-800 font-bold">正在挑選最適合您的店家...</p>
              <p className="text-gray-400 text-xs mt-1">分析外送門檻與夥伴偏好中</p>
            </div>
          </div>
        ) : aiData ? (
          <div className="space-y-6">
            {/* 推薦說明區塊 */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-md font-bold">顧問深度點評</span>
              </div>
              <div className="prose prose-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap text-[13px]">
                {aiData.text}
              </div>
            </div>
            
            {/* 地圖與地址區塊 */}
            {aiData.links.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> 餐廳快速連結與地址
                </p>
                {aiData.links.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-orange-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{link.title || '查看詳情'}</span>
                      <span className="text-orange-400 group-hover:translate-x-1 transition-transform">📍</span>
                    </div>
                    <span className="text-[11px] text-gray-400 truncate">點擊開啟 Google Maps 查看完整地址、菜單與外送資訊</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-3xl">
            <p>暫時無法獲取 5km 內的即時推薦</p>
            <p className="text-xs mt-2">請確認定位權限是否開啟</p>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3">
          <div className="flex gap-4">
            <button 
              onClick={onSpinAgain}
              className="flex-1 py-4 border-2 border-orange-500 text-orange-500 font-black rounded-2xl hover:bg-orange-50 active:scale-95 transition"
            >
              再轉一次
            </button>
            <button 
              onClick={onToggleFavorite}
              className={`flex-1 py-4 font-black rounded-2xl shadow-lg active:scale-95 transition ${isFavorited ? 'bg-red-500 text-white shadow-red-200' : 'bg-orange-500 text-white shadow-orange-200'}`}
            >
              {isFavorited ? '已收藏此類別' : '收藏類別'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
