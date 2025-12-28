
import React, { useState, useEffect, useCallback } from 'react';
import { Screen, Category } from './types';
import { CATEGORIES } from './constants';
import Roulette from './components/Roulette';
import ResultCard from './components/ResultCard';
import LocationGuide from './components/LocationGuide';
import { getAreaNameFromCoords } from './geminiService';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('lunchgo_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lunchgo_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("您的瀏覽器不支援定位功能。");
      return;
    }

    setIsRequestingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        setLocationError(null);
        setIsRequestingLocation(false);
        setShowGuide(false);

        // 取得位置後，調用 AI 解碼區域名稱
        const area = await getAreaNameFromCoords(coords.lat, coords.lng);
        setUserAddress(area);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsRequestingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("定位授權已拒絕。請開啟定位服務以解鎖轉盤。");
        } else {
          setLocationError("定位取得失敗，請檢查設備設定。");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (currentScreen === 'HOME' && !userLocation) {
      requestLocation();
    }
  }, [currentScreen, userLocation, requestLocation]);

  const toggleFavorite = (categoryId: string) => {
    setFavorites(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleSpinEnd = (result: Category) => {
    setSelectedCategory(result);
    setCurrentScreen('RESULT');
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <header className="flex-none bg-white shadow-sm py-5 px-4 text-center z-30">
        <h1 className="text-2xl font-black text-orange-600 tracking-tighter">台壽夥伴吃什麼？LunchGo!</h1>
        <p className="text-gray-400 text-[10px] mt-0.5 uppercase tracking-widest font-black">Your Best Lunch Companion</p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-28 scroll-smooth">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          
          {currentScreen === 'HOME' && (
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="text-center mb-8 px-6">
                <h2 className="text-xl font-black text-gray-800">中午時光，就該好好慰勞自己</h2>
                
                {userLocation && userAddress ? (
                  <div className="mt-3 inline-flex flex-col items-center gap-1">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm animate-in zoom-in">
                      <span className="text-xs">📍</span>
                      <span className="text-[11px] font-black">目前定位：{userAddress}</span>
                      <button onClick={requestLocation} className="ml-1 text-[10px] bg-blue-100 p-1 rounded-md hover:bg-blue-200 transition-colors">🔄</button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">✨ 已鎖定方圓 3KM 精準搜尋</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-1">請先允許定位權限，解鎖今日午餐命運！</p>
                )}
                
                {locationError && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 text-xs rounded-3xl border border-red-100 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 font-bold leading-relaxed text-center">
                      <span>📍</span> {locationError}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={requestLocation} className="px-4 py-2 bg-red-600 text-white font-black rounded-full shadow-md active:scale-95 transition">重新授權</button>
                      <button onClick={() => setShowGuide(!showGuide)} className="px-4 py-2 bg-white text-gray-600 border border-gray-200 font-bold rounded-full shadow-sm active:scale-95 transition">{showGuide ? "隱藏教學" : "如何開啟？"}</button>
                    </div>
                  </div>
                )}
                {showGuide && <LocationGuide />}
              </div>
              
              <Roulette 
                onSpinEnd={handleSpinEnd} 
                isSpinning={isSpinning} 
                setIsSpinning={setIsSpinning}
                userLocation={userLocation}
                onRequestLocation={requestLocation}
                isRequestingLocation={isRequestingLocation}
              />
            </div>
          )}

          {currentScreen === 'RESULT' && selectedCategory && (
            <ResultCard 
              category={selectedCategory} 
              userLocation={userLocation}
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
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="bg-white p-5 rounded-3xl shadow-sm border border-transparent flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner" style={{ backgroundColor: cat.color }}>🍽️</div>
                    <div>
                      <h4 className="font-black text-gray-800">{cat.name} {favorites.includes(cat.id) && '❤️'}</h4>
                      <p className="text-xs text-gray-400 mt-1">{cat.description}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleFavorite(cat.id)} className={`w-10 h-10 rounded-full flex items-center justify-center ${favorites.includes(cat.id) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-300'}`}>
                    {favorites.includes(cat.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <nav className="flex-none bg-white border-t border-gray-100 flex justify-around py-3 px-2 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <button onClick={() => setCurrentScreen('HOME')} className={`flex flex-col items-center gap-1 px-10 py-1 rounded-2xl ${currentScreen === 'HOME' || currentScreen === 'RESULT' ? 'text-orange-500 bg-orange-50' : 'text-gray-300'}`}>
          <span className="text-2xl">🎡</span><span className="text-[10px] font-black">抽籤轉盤</span>
        </button>
        <button onClick={() => setCurrentScreen('RANKING')} className={`flex flex-col items-center gap-1 px-10 py-1 rounded-2xl ${currentScreen === 'RANKING' ? 'text-orange-500 bg-orange-50' : 'text-gray-300'}`}>
          <span className="text-2xl">📋</span><span className="text-[10px] font-black">全部種類</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
