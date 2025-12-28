
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface RouletteProps {
  onSpinEnd: (result: Category) => void;
  isSpinning: boolean;
  setIsSpinning: (val: boolean) => void;
  userLocation: any;
  onRequestLocation: () => void;
  isRequestingLocation: boolean;
}

const Roulette: React.FC<RouletteProps> = ({ 
  onSpinEnd, 
  isSpinning, 
  setIsSpinning,
  userLocation,
  onRequestLocation
}) => {
  const [rotation, setRotation] = useState(0);
  const segments = CATEGORIES.length;
  const degreesPerSegment = 360 / segments;

  const handleButtonClick = () => {
    if (isSpinning) return;

    if (!userLocation) {
      onRequestLocation();
      return;
    }

    setIsSpinning(true);
    const extraRotations = 10 + Math.random() * 5; 
    const randomSegment = Math.floor(Math.random() * segments);
    const newRotation = rotation + (extraRotations * 360) + (randomSegment * degreesPerSegment);
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualRotation = newRotation % 360;
      const index = (segments - Math.floor(actualRotation / degreesPerSegment)) % segments;
      onSpinEnd(CATEGORIES[index]);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-72 h-72 md:w-80 md:h-80 mb-10">
        <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 z-30 filter drop-shadow-lg">
          <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[35px] border-t-red-600"></div>
        </div>
        
        <div className="absolute inset-[-12px] rounded-full border-[12px] border-white shadow-xl z-0"></div>
        
        <div 
          className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.1, 0, 0, 1) z-10 shadow-inner"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {CATEGORIES.map((cat, idx) => (
            <div
              key={`seg-${cat.id}`}
              className="absolute top-0 left-0 w-full h-full origin-center"
              style={{
                transform: `rotate(${idx * degreesPerSegment}deg)`,
                clipPath: `polygon(50% 50%, 50% 0, 86.4% 0)`,
                backgroundColor: cat.color
              }}
            />
          ))}
          {CATEGORIES.map((cat, idx) => (
            <div
              key={`label-${cat.id}`}
              className="absolute top-0 left-1/2 w-10 h-1/2 origin-bottom -translate-x-1/2 flex flex-col items-center pt-6 pointer-events-none"
              style={{
                transform: `translateX(-50%) rotate(${idx * degreesPerSegment + degreesPerSegment / 2}deg)`
              }}
            >
              <span className="text-xs font-black text-gray-800" style={{ writingMode: 'vertical-rl' }}>
                {cat.name}
              </span>
            </div>
          ))}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg z-20 border-4 border-gray-50 flex items-center justify-center text-xl">
             🍽️
          </div>
        </div>
      </div>

      <button
        onClick={handleButtonClick}
        disabled={isSpinning}
        className={`px-8 py-5 rounded-[2rem] text-lg font-black text-white shadow-2xl transform transition-all active:scale-95 min-w-[280px] ${
          isSpinning 
            ? 'bg-slate-400 cursor-not-allowed' 
            : !userLocation 
              ? 'bg-slate-200 text-slate-400' 
              : 'bg-gradient-to-r from-orange-500 to-red-600 shadow-orange-200'
        }`}
      >
        {isSpinning 
          ? '🎰 命運決定中...' 
          : !userLocation 
            ? '🔒 請先設定位置' 
            : '🔥 開始決定午餐'}
      </button>
    </div>
  );
};

export default Roulette;
