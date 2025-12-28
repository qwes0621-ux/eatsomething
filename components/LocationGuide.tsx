
import React from 'react';

const LocationGuide: React.FC = () => {
  return (
    <div className="mt-4 w-full bg-orange-50 border border-orange-100 rounded-3xl p-5 text-left animate-in slide-in-from-top-2 duration-300">
      <h3 className="text-sm font-black text-orange-800 mb-2 flex items-center gap-2">
        <span className="text-lg">💡</span> 搜尋小撇步
      </h3>
      <p className="text-xs text-orange-700 leading-relaxed font-medium">
        直接輸入您附近的 <span className="font-black underline decoration-orange-300">店家名稱</span>、<span className="font-black underline decoration-orange-300">景點</span> 或 <span className="font-black underline decoration-orange-300">路段</span>（例如：台北101、民生東路、國泰醫院），轉盤就會幫您抓取周邊最準確的午餐選擇！
      </p>
    </div>
  );
};

export default LocationGuide;
