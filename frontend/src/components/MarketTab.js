import React, { useState } from 'react';
import { market as apiMarket } from '../utils/api';
import Toast from './Toast';

const QUICK_CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Cotton', 'Maize', 'Soybean'];

export default function MarketTab() {
  const [crop, setCrop]       = useState('');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  const handleSearch = async (cropName) => {
    const q = cropName || crop;
    if (!q.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const res = await apiMarket(q);
      setData(res.data);
    } catch {
      setToast({ message: 'Market data unavailable. Try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="liquid-glass ks-card">
        <p className="font-grotesk text-[12px] text-cream/50 uppercase tracking-widest mb-3">🌾 Crop Name</p>
        <div className="flex gap-3">
          <input
            className="ks-input flex-1"
            placeholder="e.g. Wheat, Rice, Tomato"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={() => handleSearch()} disabled={loading}
            className="ks-btn" style={{ width: 'auto', padding: '0 24px' }}>
            {loading ? <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full spin-slow inline-block" /> : '💰'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_CROPS.map((c) => (
            <button key={c} onClick={() => { setCrop(c); handleSearch(c); }}
              className="liquid-glass px-3 py-1.5 rounded-full font-mono text-[11px] text-cream/60 hover:text-neon uppercase tracking-widest transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {data && (
        <div className="animate-fade-up space-y-4">
          <div className="market-card">
            <p className="font-condiment text-neon text-3xl mb-1">{data.crop}</p>
            <p className="font-grotesk text-[11px] text-cream/40 uppercase tracking-widest mb-4">Market Prices (per quintal)</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Min Price',  value: `₹${data.min_price}` },
                { label: 'Max Price',  value: `₹${data.max_price}` },
                { label: 'Avg Price',  value: `₹${data.avg_price}` },
              ].map((item) => (
                <div key={item.label} className="liquid-glass rounded-[14px] px-3 py-4 text-center">
                  <p className="font-grotesk text-xl text-neon">{item.value}</p>
                  <p className="font-mono text-[10px] text-cream/40 uppercase tracking-widest mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {data.records?.length > 0 && (
            <div className="result-box result-box-green">
              <p className="result-title text-neon">📍 Recent Market Data</p>
              <div className="space-y-3">
                {data.records.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div>
                      <p className="font-grotesk text-[13px] text-cream uppercase">{r.market}</p>
                      <p className="font-mono text-[11px] text-cream/40">{r.arrival_date || 'Recent'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[12px] text-cream/70">Min: ₹{r.min_price}</p>
                      <p className="font-mono text-[12px] text-cream/70">Max: ₹{r.max_price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="result-box result-box-orange">
            <p className="result-title text-orange-400">💡 Selling Tips</p>
            {['Compare prices across multiple markets before selling','Grade your produce properly for better rates','Early morning arrival gets better prices','Factor in transportation costs','Check government MSP on agricoop.gov.in'].map((t, i) => (
              <p key={i} className="font-mono text-[13px] text-cream/70 mb-1">✅ {t}</p>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="liquid-glass ks-card">
        <p className="font-grotesk text-[13px] text-cream/50 uppercase tracking-widest mb-3">📊 Market Resources</p>
        {['e-NAM Portal: enam.gov.in','AGMARKNET: agmarknet.gov.in','Mandi prices updated daily','Check MSP on agricoop.gov.in','Compare multiple markets before selling'].map((t, i) => (
          <p key={i} className="font-mono text-[13px] text-cream/50 mb-1">• {t}</p>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
