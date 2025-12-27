
import React from 'react';

const LocationGuide: React.FC = () => {
  return (
    <div className="mt-4 w-full bg-white border border-gray-100 rounded-3xl shadow-lg p-6 text-left animate-in slide-in-from-top-2 duration-300">
      <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-xl">🛠️</span> 如何開啟定位權限？
      </h3>
      
      <div className="space-y-6">
        {/* Chrome Desktop */}
        <section>
          <h4 className="text-sm font-black text-orange-600 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span> 電腦版 Chrome
          </h4>
          <ol className="text-xs text-gray-600 space-y-2 ml-2 list-decimal list-inside leading-relaxed">
            <li>點擊網址列左側的 <span className="inline-block px-1 bg-gray-100 border border-gray-200 rounded">🔒 鎖頭</span> 圖示。</li>
            <li>找到「位置」選項並切換為 <span className="font-bold text-blue-600">允許</span>。</li>
            <li>重新整理網頁即可。</li>
          </ol>
        </section>

        {/* iPhone / Safari */}
        <section>
          <h4 className="text-sm font-black text-orange-600 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span> iPhone (Safari)
          </h4>
          <ol className="text-xs text-gray-600 space-y-2 ml-2 list-decimal list-inside leading-relaxed">
            <li>打開「設定」 > 「隱私權與安全性」。</li>
            <li>點擊「定位服務」，確認已開啟。</li>
            <li>在下方列表中找到「Safari 瀏覽器」，設定為「使用期間」。</li>
            <li>回到網頁點擊「重新授權定位」。</li>
          </ol>
        </section>

        {/* Android / Chrome */}
        <section>
          <h4 className="text-sm font-black text-orange-600 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span> Android (Chrome)
          </h4>
          <ol className="text-xs text-gray-600 space-y-2 ml-2 list-decimal list-inside leading-relaxed">
            <li>點擊網址列右側的 <span className="font-bold">⋮ (更多)</span> > 「設定」。</li>
            <li>點擊「網站設定」 > 「位置」。</li>
            <li>確認已開啟，並在「封鎖」清單中移除此網址。</li>
          </ol>
        </section>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50">
        <p className="text-[10px] text-gray-400 italic text-center">
          💡 完成後請務必點擊「重新授權定位」按鈕，讓系統再次確認！
        </p>
      </div>
    </div>
  );
};

export default LocationGuide;
