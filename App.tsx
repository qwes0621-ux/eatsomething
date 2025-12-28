
import React, { useState, useEffect, useCallback } from 'react';
import { Screen, Category } from './types';
import { CATEGORIES } from './constants';
import Roulette from './components/Roulette';
import ResultCard from './components/ResultCard';
import LocationGuide from './components/LocationGuide';
import { getAreaNameFromCoords, getCoordsFromAddress } from './geminiService';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // 手動位置與確認狀態
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [isUpdatingManual, setIsUpdatingManual] = useState(false);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

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
    setIsLocationConfirmed(false);

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

        const area = await getAreaNameFromCoords(coords.lat, coords.lng);
        setUserAddress(area);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsRequestingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("定位授權已拒絕。您可以選擇手動輸入位置。");
        } else {
          setLocationError("定位取得失敗，請手動輸入位置。");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleManualAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim()) return;

    setIsUpdatingManual(true);
    const result = await getCoordsFromAddress(manualAddress);
    
    if (result && result.lat && result.lng) {
      setUserLocation({ lat: result.lat, lng: result.lng });
      setUserAddress(result.area);
      setIsLocationConfirmed(true);
      setIsEditingLocation(false);
      setManualAddress('');
    } else {
      alert("抱歉，AI 找不到這個地點，請輸入更具體的地址或地標。");
    }
    setIsUpdatingManual(false);
  };

  useEffect(() => {
    if (currentScreen === 'HOME' && !userLocation && !isLocationConfirmed && !isEditingLocation) {
      requestLocation();
    }
  }, [currentScreen, userLocation, requestLocation, isLocationConfirmed, isEditingLocation]);

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
              <div className="text-center mb-8 px-6 w-full">
                <h2 className="text-xl font-black text-gray-800">中午時光，就該好好慰勞自己</h2>
                
                <div className="mt-5 flex flex-col items-center w-full">
                  {!isEditingLocation ? (
                    userLocation && userAddress ? (
                      <div className="w-full flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                        <div className={`w-full max-w-xs p-4 rounded-[2rem] border-2 transition-all flex flex-col gap-3 ${isLocationConfirmed ? 'bg-orange-50 border-orange-200' : 'bg-white border-blue-100 shadow-xl shadow-blue-50'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{isLocationConfirmed ? '🎯' : '📍'}</span>
                            <div className="text-left">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isLocationConfirmed ? '搜尋中心已確認' : '偵測到位置'}</p>
                              <p className="text-sm font-black text-gray-800 leading-tight">{userAddress}</p>
                            </div>
                          </div>
                          
                          {!isLocationConfirmed ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setIsLocationConfirmed(true)}
                                className="flex-1 bg-blue-600 text-white text-xs font-black py-2.5 rounded-xl shadow-md active:scale-95 transition-all"
                              >✅ 確認位置</button>
                              <button 
                                onClick={() => setIsEditingLocation(true)}
                                className="flex-1 bg-slate-100 text-slate-500 text-xs font-black py-2.5 rounded-xl active:scale-95 transition-all"
                              >✏️ 修改</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setIsLocationConfirmed(false)}
                              className="text-[10px] font-black text-orange-500 underline text-right"
                            >更換搜尋地點</button>
                          )}
                        </div>
                        {isLocationConfirmed && (
                          <p className="text-[10px] text-orange-400 font-black animate-pulse mt-2">✨ 已鎖定 3KM 範圍，請點擊轉盤開始！</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-gray-500 text-sm mt-1">{isRequestingLocation ? '📍 定位偵測中...' : '尚未取得定位'}</p>
                        <button 
                          onClick={() => setIsEditingLocation(true)}
                          className="px-6 py-2.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full border border-indigo-100 shadow-sm active:scale-95"
                        >⌨️ 手動輸入地址</button>
                      </div>
                    )
                  ) : (
                    <form onSubmit={handleManualAddressSubmit} className="w-full max-w-xs animate-in slide-in-from-top-2 duration-300">
                      <div className="bg-white p-5 rounded-[2rem] border-2 border-indigo-100 shadow-2xl shadow-indigo-50 flex flex-col gap-4">
                        <h4 className="text-sm font-black text-indigo-600">手動輸入搜尋地點</h4>
                        <input
                          autoFocus
                          type="text"
                          value={manualAddress}
                          onChange={(e) => setManualAddress(e.target.value)}
                          placeholder="例如：捷運中山站、台北101..."
                          disabled={isUpdatingManual}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-300 focus:bg-white outline-none transition-all"
                        />
                        <div className="flex gap-2">
                          <button 
                            type="submit" 
                            disabled={isUpdatingManual || !manualAddress.trim()}
                            className="flex-1 bg-indigo-600 text-white text-xs font-black py-3 rounded-xl shadow-lg active:scale-95 disabled:bg-slate-300"
                          >
                            {isUpdatingManual ? '🔍 解析中...' : '✅ 確定地點'}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsEditingLocation(false)}
                            className="px-4 py-3 bg-white border border-slate-200 text-slate-400 text-xs font-black rounded-xl active:scale-95"
                          >取消</button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
                
                {locationError && !isLocationConfirmed && !isEditingLocation && (
                  <div className="mt-6 p-4 bg-red-50 text-red-700 text-[11px] rounded-3xl border border-red-100 flex flex-col items-center gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2 font-black leading-relaxed text-center">
                      <span>⚠️</span> {locationError}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={requestLocation} className="px-5 py-2 bg-red-600 text-white font-black rounded-xl shadow-md active:scale-95">重新偵測</button>
                      <button onClick={() => setShowGuide(!showGuide)} className="px-5 py-2 bg-white text-gray-500 border border-gray-200 font-bold rounded-xl shadow-sm">{showGuide ? "隱藏教學" : "教學"}</button>
                    </div>
                  </div>
                )}
                {showGuide && <LocationGuide />}
              </div>
              
              <Roulette 
                onSpinEnd={handleSpinEnd} 
                isSpinning={isSpinning} 
                setIsSpinning={setIsSpinning}
                userLocation={isLocationConfirmed ? userLocation : null}
                onRequestLocation={() => setIsEditingLocation(true)}
                isRequestingLocation={isRequestingLocation || isUpdatingManual}
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
        <button onClick={() => {
          setIsLocationConfirmed(false);
          setCurrentScreen('HOME');
        }} className={`flex flex-col items-center gap-1 px-10 py-1 rounded-2xl ${currentScreen === 'HOME' || currentScreen === 'RESULT' ? 'text-orange-500 bg-orange-50' : 'text-gray-300'}`}>
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
