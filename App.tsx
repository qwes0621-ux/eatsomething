
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
  
  // 使用者定位狀態
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // 收藏清單狀態
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
        setShowGuide(false); // 成功後關閉教學
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsRequestingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("您拒絕了定位授權。為了推薦 5km 內的台壽夥伴美食，必須開啟定位才能使用轉盤。");
        } else {
          setLocationError("定位取得失敗，請檢查網路或 GPS 訊號後重試。");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // 組件載入時自動請求定位
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
      {/* Header */}
      <header className="flex-none bg-white shadow-sm py-6 px-4 text-center z-30">
        <h1 className="text-2xl font-black text-orange-600 tracking-wider">台壽夥伴吃什麼？</h1>
        <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest font-bold">Taiwan Life Partners' Lunch Guide</p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-28 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          
          {currentScreen === 'HOME' && (
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="text-center mb-10 px-6">
                <h2 className="text-xl font-black text-gray-800">辛苦了！夥伴們中午吃好點</h2>
                <p className="text-gray-500 text-sm mt-1">轉動輪盤，讓命運決定今天的能量來源！</p>
                
                {locationError && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 font-bold leading-relaxed">
                      <span className="text-lg">📍</span> {locationError}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={requestLocation}
                        className="px-4 py-2 bg-red-600 text-white font-black rounded-full shadow-md active:scale-95 transition"
                      >
                        重新授權定位
                      </button>
                      <button 
                        onClick={() => setShowGuide(!showGuide)}
                        className="px-4 py-2 bg-white text-gray-600 border border-gray-200 font-bold rounded-full shadow-sm active:scale-95 transition"
                      >
                        {showGuide ? "隱藏教學" : "如何開啟？"}
                      </button>
                    </div>
                  </div>
                )}

                {showGuide && <LocationGuide />}
                
                {isRequestingLocation && !userLocation && (
                  <div className="mt-4 p-3 bg-blue-50 text-blue-600 text-xs rounded-2xl border border-blue-100 animate-pulse font-bold">
                    🔍 正在尋找夥伴的位置...
                  </div>
                )}
              </div>
              
              <Roulette 
                onSpinEnd={handleSpinEnd} 
                isSpinning={isSpinning} 
                setIsSpinning={setIsSpinning}
                userLocation={userLocation}
                onRequestLocation={requestLocation}
                isRequestingLocation={isRequestingLocation}
              />

              {history.length > 0 && (
                <div className="mt-12 w-full text-center">
                  <h3 className="text-gray-400 text-[10px] font-bold mb-4 uppercase tracking-widest">最近抽中</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {history.map((h, i) => (
                      <span key={i} className="px-4 py-1.5 bg-white border border-gray-100 rounded-full text-xs text-gray-500 shadow-sm font-medium">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentScreen === 'RESULT' && selectedCategory && (
            <div className="w-full flex justify-center">
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
            </div>
          )}

          {currentScreen === 'RANKING' && (
            <div className="w-full animate-in slide-in-from-bottom-8 duration-500">
               <div className="sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-10 mb-2 flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-800">類別概覽</h2>
              </div>
              <div className="space-y-4">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="bg-white p-5 rounded-3xl shadow-sm border border-transparent hover:border-orange-200 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner" style={{ backgroundColor: cat.color }}>
                        🍽️
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800 flex items-center gap-2">
                          {cat.name}
                          {favorites.includes(cat.id) && <span className="text-red-500 text-sm">❤️</span>}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">{cat.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleFavorite(cat.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${favorites.includes(cat.id) ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-gray-50 text-gray-300 opacity-0 group-hover:opacity-100'}`}
                    >
                      {favorites.includes(cat.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentScreen === 'AI_SUGGEST' && (
            <div className="w-full text-center space-y-6">
              <h2 className="text-xl font-black text-gray-800">台壽夥伴 AI 專屬推薦</h2>
              {isLoadingAi ? (
                <div className="flex flex-col items-center py-20 space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">🥗</div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-800 font-bold">正在為夥伴尋找最佳美味...</p>
                    <p className="text-gray-400 text-xs">Gemini AI 正在分析您的偏好</p>
                  </div>
                </div>
              ) : aiRec ? (
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-blue-50 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center rounded-3xl mx-auto mb-6 text-3xl shadow-lg shadow-blue-100">
                    🤖
                  </div>
                  <h3 className="text-2xl font-black text-indigo-700 mb-2">{aiRec.recommendedCategory}</h3>
                  <div className="bg-blue-50/50 p-4 rounded-2xl mb-6">
                    <p className="text-gray-600 text-sm leading-relaxed font-medium italic">「{aiRec.reason}」</p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left ml-1">建議菜單</h4>
                    {aiRec.suggestions.map((s: string, i: number) => (
                      <div key={i} className="py-3 px-5 bg-white border border-blue-100 text-indigo-700 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all flex items-center">
                        <span className="mr-3 text-lg">🍴</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-gray-400">無法生成推薦，請稍後再試。</div>
              )}
              <button 
                onClick={() => setCurrentScreen('HOME')}
                className="mt-4 px-8 py-3 bg-gray-100 text-gray-500 font-black rounded-full hover:bg-gray-200 transition-all text-sm active:scale-95"
              >
                返回轉盤
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Navigation Bar */}
      <nav className="flex-none bg-white border-t border-gray-100 flex justify-around py-3 px-2 z-40 safe-area-inset-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => setCurrentScreen('HOME')}
          className={`flex flex-col items-center gap-1.5 transition-all px-6 py-1 rounded-2xl ${currentScreen === 'HOME' || currentScreen === 'RESULT' ? 'text-orange-500 bg-orange-50' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <span className="text-2xl">🎡</span>
          <span className="text-[10px] font-black">轉盤</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('RANKING')}
          className={`flex flex-col items-center gap-1.5 transition-all px-6 py-1 rounded-2xl ${currentScreen === 'RANKING' ? 'text-orange-500 bg-orange-50' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <span className="text-2xl">📋</span>
          <span className="text-[10px] font-black">類別</span>
        </button>
        <button 
          onClick={fetchAiRec}
          className={`flex flex-col items-center gap-1.5 transition-all px-6 py-1 rounded-2xl ${currentScreen === 'AI_SUGGEST' ? 'text-orange-500 bg-orange-50' : 'text-gray-300 hover:text-gray-400'}`}
        >
          <span className="text-2xl">🧠</span>
          <span className="text-[10px] font-black">AI 建議</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
