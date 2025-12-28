
import React, { useState, useEffect, useCallback } from 'react';
import { Screen, Category } from './types';
import { CATEGORIES } from './constants';
import Roulette from './components/Roulette';
import ResultCard from './components/ResultCard';
import LocationGuide from './components/LocationGuide';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // 通訊處驗證：只要包含「愛鷹」二字即可解鎖
  const [officeName, setOfficeName] = useState('');
  const isUnlocked = officeName.includes('愛鷹');

  // 使用者手動輸入的地址
  const [manualAddress, setManualAddress] = useState<string>(() => {
    return localStorage.getItem('lunchgo_address') || '';
  });
  const [tempAddress, setTempAddress] = useState(manualAddress);
  const [isEditing, setIsEditing] = useState(!manualAddress);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('lunchgo_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lunchgo_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAddress.trim()) {
      setManualAddress(tempAddress);
      localStorage.setItem('lunchgo_address', tempAddress);
      setIsEditing(false);
    }
  };

  const toggleFavorite = useCallback((categoryId: string) => {
    setFavorites(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  }, []);

  const handleSpinEnd = (result: Category) => {
    setSelectedCategory(result);
    setCurrentScreen('RESULT');
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
      <header className="flex-none bg-white shadow-sm py-5 px-4 text-center z-30">
        <h1 className="text-2xl font-black text-orange-600 tracking-tighter italic">台壽夥伴吃好料</h1>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black">LunchGo!</p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-28 scroll-smooth">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          
          {currentScreen === 'HOME' && (
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
              
              {/* 地址輸入區塊 */}
              <div className="w-full max-w-sm mb-6">
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    <form onSubmit={saveAddress} className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-orange-100 animate-in zoom-in duration-300">
                      <label className="block text-sm font-black text-gray-700 mb-3 ml-2">📍 您在哪個位置附近？</label>
                      <input 
                        autoFocus
                        type="text"
                        value={tempAddress}
                        onChange={(e) => setTempAddress(e.target.value)}
                        placeholder="打上店家、景點或路段名稱..."
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-orange-400 focus:bg-white outline-none transition-all shadow-inner"
                      />
                      <button 
                        type="submit"
                        disabled={!tempAddress.trim()}
                        className="w-full mt-4 bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 disabled:bg-slate-300 transition-all"
                      >
                        確定地點
                      </button>
                    </form>
                    <LocationGuide />
                  </div>
                ) : (
                  <div className="bg-white px-6 py-4 rounded-full shadow-md border border-slate-100 flex items-center justify-between group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xl">📍</span>
                      <div className="overflow-hidden">
                        <p className="text-[9px] text-gray-400 font-black uppercase">搜尋中心</p>
                        <p className="text-sm font-black text-gray-800 truncate">{manualAddress}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-full active:scale-95"
                    >
                      修改
                    </button>
                  </div>
                )}
              </div>

              {/* 通訊處驗證區塊 */}
              {!isEditing && (
                <div className="w-full max-w-sm mb-8 animate-in slide-in-from-bottom-2 duration-500">
                  <div className={`bg-white px-6 py-4 rounded-[2rem] shadow-md border-2 transition-all ${isUnlocked ? 'border-green-400 bg-green-50/30' : 'border-slate-100 focus-within:border-orange-300'}`}>
                    <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-wider ml-1">
                       輸入通訊處名稱 {isUnlocked && <span className="text-green-500 ml-2">✓ 驗證通過</span>}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{isUnlocked ? '🦅' : '🔒'}</span>
                      <input 
                        type="text"
                        value={officeName}
                        onChange={(e) => setOfficeName(e.target.value)}
                        placeholder="輸入通訊處名稱"
                        className="w-full bg-transparent text-sm font-black outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <Roulette 
                onSpinEnd={handleSpinEnd} 
                isSpinning={isSpinning} 
                setIsSpinning={setIsSpinning}
                userLocation={manualAddress && isUnlocked ? { lat: 0, lng: 0 } : null} 
                onRequestLocation={() => {
                   if (!manualAddress) setIsEditing(true);
                }}
                isRequestingLocation={false}
              />
              
              {!isEditing && manualAddress && !isSpinning && (
                <div className="mt-8 flex flex-col items-center">
                   {!isUnlocked ? (
                      <p className="text-[11px] text-red-500 font-black bg-red-50 px-4 py-2 rounded-full border border-red-100 animate-bounce">
                        ⚠️ 請輸入通訊處名稱（含愛鷹）以解鎖功能
                      </p>
                   ) : (
                      <p className="text-[11px] text-slate-400 font-bold italic animate-pulse">
                         ✨ 已識別愛鷹夥伴！點擊按鈕決定午餐吧
                      </p>
                   )}
                </div>
              )}
            </div>
          )}

          {currentScreen === 'RESULT' && selectedCategory && (
            <ResultCard 
              category={selectedCategory} 
              userLocation={null} 
              isFavorited={favorites.includes(selectedCategory.id)}
              onToggleFavorite={() => toggleFavorite(selectedCategory.id)}
              onSpinAgain={() => {
                setSelectedCategory(null);
                setCurrentScreen('HOME');
              }} 
            />
          )}

          {currentScreen === 'RANKING' && (
            <div className="w-full animate-in slide-in-from-bottom-8 duration-500 space-y-4">
              <h2 className="text-xl font-black text-gray-800 mb-2 px-2">料理種類</h2>
              <div className="grid gap-3">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="bg-white p-5 rounded-3xl shadow-sm border border-transparent flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner" style={{ backgroundColor: cat.color }}>🍽️</div>
                      <div>
                        <h4 className="font-black text-gray-800">{cat.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{cat.description}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleFavorite(cat.id)} className={`w-10 h-10 rounded-full flex items-center justify-center ${favorites.includes(cat.id) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-300'}`}>
                      {favorites.includes(cat.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <nav className="flex-none bg-white border-t border-gray-100 flex justify-around py-4 px-2 z-40">
        <button onClick={() => setCurrentScreen('HOME')} className={`flex flex-col items-center gap-1 px-8 py-1 rounded-2xl transition-all ${currentScreen === 'HOME' || currentScreen === 'RESULT' ? 'text-orange-600 bg-orange-50' : 'text-gray-300'}`}>
          <span className="text-2xl">🎡</span><span className="text-[10px] font-black">首頁轉盤</span>
        </button>
        <button onClick={() => setCurrentScreen('RANKING')} className={`flex flex-col items-center gap-1 px-8 py-1 rounded-2xl transition-all ${currentScreen === 'RANKING' ? 'text-orange-600 bg-orange-50' : 'text-gray-300'}`}>
          <span className="text-2xl">📋</span><span className="text-[10px] font-black">口袋名單</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
