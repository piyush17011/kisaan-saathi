import React, { useState, useEffect } from 'react';
import Navbar    from '../components/Navbar';
import AskTab    from '../components/AskTab';
import WeatherTab from '../components/WeatherTab';
import TipsTab   from '../components/TipsTab';
import MarketTab from '../components/MarketTab';
import { weather as apiWeather } from '../utils/api';

const TABS = [
  { id: 'ask',     label: '🤖', fullLabel: 'Ask AI' },
  { id: 'weather', label: '🌤️', fullLabel: 'Weather' },
  { id: 'tips',    label: '💡', fullLabel: 'Tips' },
  { id: 'market',  label: '💰', fullLabel: 'Market' },
];

function weatherIcon(main) {
  const map = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
    Haze: '🌫️', Smoke: '🌫️',
  };
  return map[main] || '🌡️';
}

export default function Home() {
  const farmer   = JSON.parse(localStorage.getItem('farmer') || '{}');
  const [tab, setTab] = useState('ask');
  const [homeWeather, setHomeWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const geoData = await geoRes.json();
          const addr = geoData.address || {};
          const city = addr.city || addr.town || addr.village || addr.state_district || addr.state || '';
          if (!city) { setWeatherLoading(false); return; }
          const res = await apiWeather(city);
          setHomeWeather(res.data);
        } catch {}
        finally { setWeatherLoading(false); }
      },
      () => setWeatherLoading(false)
    );
  }, []);

  const weatherContext = homeWeather
    ? `Current weather at ${homeWeather.city}: ${homeWeather.temp}°C, feels like ${homeWeather.feels_like}°C, ${homeWeather.description}, humidity ${homeWeather.humidity}%, wind ${homeWeather.wind_speed} m/s.`
    : null;

  return (
    <div className="bg-background min-h-screen text-cream">
      <Navbar farmerName={farmer.name} />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-60"
          style={{ background: 'radial-gradient(ellipse, rgba(111,255,0,0.04) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-20 md:pt-24 md:pb-10">

        {/* Header row */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-condiment text-neon text-3xl md:text-4xl leading-tight truncate">
              Hello, {farmer.name || 'Farmer'}!
            </p>
            <h1 className="font-grotesk text-lg md:text-2xl uppercase text-cream leading-tight mt-0.5">
              Smart Farming Assistant
            </h1>
            <p className="font-mono text-[11px] text-cream/35 uppercase tracking-widest mt-1">
              आपका स्मार्ट कृषि सहायक
            </p>
          </div>

          {/* Weather widget */}
          {weatherLoading && (
            <div className="liquid-glass rounded-2xl px-3 py-2.5 flex items-center gap-2 flex-shrink-0">
              <div className="w-3.5 h-3.5 border-2 border-neon/30 border-t-neon rounded-full spin-slow" />
              <span className="font-mono text-[10px] text-cream/40 uppercase tracking-widest hidden sm:block">Weather</span>
            </div>
          )}
          {homeWeather && !weatherLoading && (
            <div
              className="liquid-glass rounded-2xl px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-all flex-shrink-0 active:scale-95"
              onClick={() => setTab('weather')}
              title="Click to open Weather tab"
            >
              <span className="text-xl">{weatherIcon(homeWeather.main)}</span>
              <div>
                <p className="font-grotesk text-lg text-cream leading-none">{homeWeather.temp}°C</p>
                <p className="font-mono text-[9px] text-cream/40 uppercase tracking-widest mt-0.5 max-w-[80px] truncate">
                  {homeWeather.city}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="liquid-glass rounded-2xl flex mb-5 overflow-hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`ks-tab ${tab === t.id ? 'active' : ''}`}
            >
              <span className="text-base sm:hidden">{t.label}</span>
              <span className="hidden sm:inline">{t.label} {t.fullLabel}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {tab === 'ask'     && <AskTab farmerId={farmer.id} weatherContext={weatherContext} />}
          {tab === 'weather' && <WeatherTab />}
          {tab === 'tips'    && <TipsTab />}
          {tab === 'market'  && <MarketTab />}
        </div>
      </div>
    </div>
  );
}