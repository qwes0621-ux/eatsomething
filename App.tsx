
import React, { useState, useEffect, useCallback } from 'react';
import { Screen, Category } from './types';
import { CATEGORIES } from './constants';
import Roulette from './components/Roulette';
import ResultCard from './components/ResultCard';
import LocationGuide from './components/LocationGuide';
import { getAIRecommendation, getNearbyRecommendation } from './geminiService';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [aiRec, setAiRec] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [nearbyData, setNearbyData] = useState<any>(null);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
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
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
        setIsRequestingLocation(false);
        setShowGuide(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsRequestingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("定位授權已拒絕。請開啟定位以便尋找 5km 內的美味餐廳。");
        } else {
          setLocationError("定位取得失敗，請檢查網路或 GPS 訊號後重試。");
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

  const handleSpinEnd = async (result: Category) => {
    setSelectedCategory(result);
    setHistory(prev => [result.name, ...prev].slice(0, 10));
    setCurrentScreen('RESULT');
    
    if (userLocation) {
      setIsLoadingNearby(true);
      try {
        const data = await getNearbyRecommendation(result.name, userLocation.lat, userLocation.lng);
        setNearbyData(data);
      } catch (e) {
        console.error("Recommendation fetch error:", e);
      } finally {
        setIsLoadingNearby(false);
      }
    }
  };

  const fetchAiRec = async () => {
    setIsLoadingAi(true);
    setCurrentScreen('AI_SUGGEST');
    const rec = await getAIRecommendation(history);
    setAiRec(rec);
    setIsLoadingAi(false);
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
                <p className="text-gray-500 text-sm mt-1">點擊下方按鈕，讓命運為你決定！</p>
                
                {locationError && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 text-xs rounded-3xl border border-red-100 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 font-bold leading-relaxed">
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
              aiData={nearbyData}
              isLoading={isLoadingNearby}
              isFavorited={favorites.includes(selectedCategory.id)}
              onToggleFavorite={() => toggleFavorite(selectedCategory.id)}
              onSpinAgain={() => {
                setSelectedCategory(null);
                setNearbyData(null);
                setCurrentScreen('HOME');
              }} 
            />
          )}

          {currentScreen === 'RANKING' && (
            <div className="w-full animate-in slide-in-from-bottom-8 duration-500 space-y-4">
              <h2 className="text-xl font-black text-gray-800 mb-2">類別總覽</h2>
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

          {currentScreen === 'AI_SUGGEST' && (
            <div className="w-full text-center space-y-6">
              <h2 className="text-xl font-black text-gray-800">LunchGo! AI 專屬推薦</h2>
              {isLoadingAi ? (
                <div className="flex flex-col items-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                  <p className="text-gray-400 text-sm font-bold animate-pulse">正在為您精選最佳組合...</p>
                </div>
              ) : aiRec ? (
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-blue-50">
                  <div className="w-20 h-20 bg-blue-600 text-white flex items-center justify-center rounded-3xl mx-auto mb-6 text-3xl shadow-lg">🤖</div>
                  <h3 className="text-2xl font-black text-blue-700 mb-2">{aiRec.recommendedCategory}</h3>
                  <div className="bg-blue-50/50 p-4 rounded-2xl mb-6">
                    <p className="text-gray-600 text-sm italic font-medium">「{aiRec.reason}」</p>
                  </div>
                  <div className="space-y-3">
                    {aiRec.suggestions.map((s: string, i: number) => (
                      <div key={i} className="py-3 px-5 bg-white border border-blue-100 text-blue-700 rounded-2xl font-bold flex items-center">
                        <span className="mr-3 text-lg">🍴</span>{s}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="py-20 text-gray-400">無法生成推薦，請稍後再試。</p>
              )}
              <button onClick={() => setCurrentScreen('HOME')} className="px-8 py-3 bg-gray-100 text-gray-500 font-black rounded-full text-sm">返回首頁</button>
            </div>
          )}
        </div>
      </main>

      <nav className="flex-none bg-white border-t border-gray-100 flex justify-around py-3 px-2 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <button onClick={() => setCurrentScreen('HOME')} className={`flex flex-col items-center gap-1 px-6 py-1 rounded-2xl ${currentScreen === 'HOME' || currentScreen === 'RESULT' ? 'text-orange-500 bg-orange-50' : 'text-gray-300'}`}>
          <span className="text-2xl">🎡</span><span className="text-[10px] font-black">轉盤</span>
        </button>
        <button onClick={() => setCurrentScreen('RANKING')} className={`flex flex-col items-center gap-1 px-6 py-1 rounded-2xl ${currentScreen === 'RANKING' ? 'text-orange-500 bg-orange-50' : 'text-gray-300'}`}>
          <span className="text-2xl">📋</span><span className="text-[10px] font-black">類別</span>
        </button>
        <button onClick={fetchAiRec} className={`flex flex-col items-center gap-1 px-6 py-1 rounded-2xl ${currentScreen === 'AI_SUGGEST' ? 'text-orange-500 bg-orange-50' : 'text-gray-300'}`}>
          <span className="text-2xl">🧠</span><span className="text-[10px] font-black">AI 建議</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
