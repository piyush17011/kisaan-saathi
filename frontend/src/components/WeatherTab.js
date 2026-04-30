import React, { useState } from 'react';
import { weather as apiWeather } from '../utils/api';
import Toast from './Toast';

const QUICK_CITIES = ['Mumbai', 'Pune', 'Delhi', 'Nagpur', 'Nashik', 'Aurangabad'];

function getFarmingAdvice(w) {
  if (!w) return [];
  const advice = [];
  if (w.temp > 35)      { advice.push('🌡️ High temperature — increase irrigation frequency'); advice.push('⏰ Irrigate early morning (5–7 AM) or evening (6–8 PM)'); }
  else if (w.temp < 15) { advice.push('❄️ Cold weather — protect young plants from frost'); advice.push('🌱 Good time for winter crops like wheat, mustard'); }
  if (w.humidity > 80)  { advice.push('💧 High humidity — watch for fungal diseases'); advice.push('🍃 Ensure good air circulation in crops'); }
  else if (w.humidity < 40) { advice.push('🏜️ Low humidity — increase irrigation'); advice.push('💦 Use mulching to retain soil moisture'); }
  if (w.main === 'Rain' || w.main === 'Drizzle') { advice.push('🌧️ Rain expected — postpone pesticide spraying'); advice.push('⛔ Avoid irrigation today'); }
  else if (w.main === 'Clear') { advice.push('☀️ Clear weather — good for spraying operations'); advice.push('✅ Suitable for harvesting activities'); }
  if (w.wind_speed > 5) advice.push('💨 Windy — avoid pesticide / fertilizer spraying');
  return advice;
}

export default function WeatherTab() {
  const [city, setCity]         = useState('');
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const handleSearch = async (cityName) => {
    const q = cityName || city;
    if (!q.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const res = await apiWeather(q);
      setData(res.data);
    } catch {
      setToast({ message: 'City not found or weather service unavailable.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="liquid-glass ks-card">
        <p className="font-grotesk text-[12px] text-cream/50 uppercase tracking-widest mb-3">📍 Enter City Name</p>
        <div className="flex gap-3">
          <input
            className="ks-input flex-1"
            placeholder="e.g. Mumbai, Pune, Delhi"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={() => handleSearch()} disabled={loading}
            className="ks-btn" style={{ width: 'auto', padding: '0 24px' }}>
            {loading ? <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full spin-slow inline-block" /> : '🌤️'}
          </button>
        </div>
        {/* Quick cities */}
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_CITIES.map((c) => (
            <button key={c} onClick={() => { setCity(c); handleSearch(c); }}
              className="liquid-glass px-3 py-1.5 rounded-full font-mono text-[11px] text-cream/60 hover:text-neon uppercase tracking-widest transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Weather result */}
      {data && (
        <div className="animate-fade-up space-y-4">
          <div className="weather-hero">
            <p className="font-grotesk text-2xl text-cream uppercase">{data.city}, {data.country}</p>
            <p className="font-grotesk text-6xl text-cream mt-2">{data.temp}°C</p>
            <p className="font-mono text-[14px] text-cream/60 mt-1 uppercase tracking-widest">{data.description}</p>
            <p className="font-mono text-[12px] text-cream/40 mt-1">Feels like {data.feels_like}°C</p>
          </div>

          {/* Detail grid */}
          <div className="liquid-glass ks-card grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '💧 Humidity',  value: `${data.humidity}%` },
              { label: '💨 Wind',      value: `${data.wind_speed} m/s` },
              { label: '☁️ Clouds',   value: `${data.clouds}%` },
              { label: '📊 Pressure', value: `${data.pressure} hPa` },
              { label: '🌡️ Min',      value: `${data.temp_min}°C` },
              { label: '🌡️ Max',      value: `${data.temp_max}°C` },
              { label: '🌅 Sunrise',  value: data.sunrise },
              { label: '🌇 Sunset',   value: data.sunset },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="font-mono text-[11px] text-cream/40 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="font-grotesk text-[15px] text-cream">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Farming advice */}
          <div className="result-box result-box-orange">
            <p className="result-title text-orange-400">🌾 Farming Advice</p>
            <ul className="space-y-2">
              {getFarmingAdvice(data).map((tip, i) => (
                <li key={i} className="font-mono text-[13px] text-cream/75">{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="liquid-glass ks-card">
        <p className="font-grotesk text-[13px] text-cream/50 uppercase tracking-widest mb-3">🌤️ Weather Guidelines</p>
        {['Check weather daily for farming operations','Avoid spraying before rain','Plan harvest based on 3-day forecast','Monitor temperature for disease control','High humidity = fungal disease risk'].map((t, i) => (
          <p key={i} className="font-mono text-[13px] text-cream/50 mb-1">• {t}</p>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
