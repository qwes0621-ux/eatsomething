
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface RouletteProps {
  onSpinEnd: (result: Category) => void;
  isSpinning: boolean;
  setIsSpinning: (val: boolean) => void;
  userLocation: {lat: number, lng: number} | null;
  onRequestLocation: () => void;
  isRequestingLocation: boolean;
}

const Roulette: React.FC<RouletteProps> = ({ 
  onSpinEnd, 
  isSpinning, 
  setIsSpinning,
  userLocation,
  onRequestLocation,
  isRequestingLocation
}) => {
  const [rotation, setRotation] = useState(0);
  const segments = CATEGORIES.length;
  const degreesPerSegment = 360 / segments;

  const handleButtonClick = () => {
    if (isSpinning || isRequestingLocation) return;

    // 若尚未取得定位，先請求授權
    if (!userLocation) {
      onRequestLocation();
      return;
    }

    // 已有定位，開始轉盤
    setIsSpinning(true);
    const extraRotations = 8 + Math.random() * 5; 
    const randomSegment = Math.floor(Math.random() * segments);
    const newRotation = rotation + (extraRotations * 360) + (randomSegment * degreesPerSegment);
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualRotation = newRotation % 360;
      // 指針在正上方 (0度)，計算落在指針下的索引
      const index = (segments - Math.floor(actualRotation / degreesPerSegment)) % segments;
      onSpinEnd(CATEGORIES[index]);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-72 h-72 md:w-80 md:h-80 mb-10">
        {/* 指針容器 */}
        <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 z-30 filter drop-shadow-lg">
          <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[35px] border-t-red-600"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full mt-1 opacity-50"></div>
        </div>

        {/* 轉盤外框裝飾 */}
        <div className="absolute inset-[-12px] rounded-full border-[12px] border-white shadow-xl z-0"></div>

        {/* 轉盤主體 */}
        <div 
          className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.2, 0, 0, 1) z-10 shadow-inner"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* 第一層：背景扇區 */}
          {CATEGORIES.map((cat, idx) => {
            return (
              <div
                key={`seg-${cat.id}`}
                className="absolute top-0 left-0 w-full h-full origin-center"
                style={{
                  transform: `rotate(${idx * degreesPerSegment}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0, 86.4% 0)`,
                  backgroundColor: cat.color
                }}
              />
            );
          })}

          {/* 第二層：文字標籤 */}
          {CATEGORIES.map((cat, idx) => (
            <div
              key={`label-${cat.id}`}
              className="absolute top-0 left-1/2 w-10 h-1/2 origin-bottom -translate-x-1/2 flex flex-col items-center pt-6 pointer-events-none"
              style={{
                transform: `translateX(-50%) rotate(${idx * degreesPerSegment + degreesPerSegment / 2}deg)`
              }}
            >
              <span 
                className="text-xs md:text-sm font-black text-gray-800 leading-none tracking-tighter"
                style={{ writingMode: 'vertical-rl' }}
              >
                {cat.name}
              </span>
            </div>
          ))}
          
          {/* 中心裝飾點 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg z-20 flex items-center justify-center border-4 border-gray-50">
             <div className="w-5 h-5 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full animate-pulse shadow-inner"></div>
          </div>
        </div>
      </div>

      <button
        onClick={handleButtonClick}
        disabled={isSpinning || isRequestingLocation}
        className={`px-8 py-4 rounded-2xl text-lg font-black text-white shadow-[0_10px_20px_rgba(249,115,22,0.3)] transform transition-all active:scale-95 active:translate-y-1 min-w-[260px] ${
          isSpinning || isRequestingLocation
            ? 'bg-gray-300 cursor-not-allowed grayscale' 
            : !userLocation 
              ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_10px_20px_rgba(37,99,235,0.3)]'
              : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:brightness-110'
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          {isSpinning ? (
            <>🎲 命運轉動中...</>
          ) : isRequestingLocation ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              取得定位中...
            </span>
          ) : !userLocation ? (
            <>📍 點擊授權定位</>
          ) : (
            <>🔥 開始轉盤</>
          )}
        </span>
      </button>
      
      {!isSpinning && !userLocation && (
        <p className="text-[11px] text-gray-500 mt-5 font-bold text-center leading-relaxed">
          🔒 定位服務僅用於搜尋附近 5km 餐廳<br/>
          請點擊按鈕開啟權限以繼續
        </p>
      )}
    </div>
  );
};

export default Roulette;
