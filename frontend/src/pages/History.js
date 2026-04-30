import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { history as apiHistory } from '../utils/api';

function AnswerBlock({ answer }) {
  if (!answer) return null;
  const data = typeof answer === 'string'
    ? (() => { try { return JSON.parse(answer); } catch { return { overall_analysis: answer }; } })()
    : answer;
  return (
    <div className="space-y-3 mt-3">
      {data.fertilizers?.length > 0 && (
        <div className="result-box result-box-green">
          <p className="result-title text-neon text-[12px]">🌾 Fertilizer Recommendations</p>
          {data.fertilizers.map((f, i) => (
            <p key={i} className="font-mono text-[12px] text-cream/70">• {f.name} — {f.quantity_per_acre} per acre</p>
          ))}
        </div>
      )}
      {data.overall_analysis && (
        <div className="result-box result-box-orange">
          <p className="result-title text-orange-400 text-[12px]">📋 Analysis</p>
          <p className="font-mono text-[12px] text-cream/70 leading-relaxed">{data.overall_analysis}</p>
        </div>
      )}
      {data.soil_analysis_and_tips?.length > 0 && (
        <div className="result-box result-box-blue">
          <p className="result-title text-blue-400 text-[12px]">🌱 Soil Tips</p>
          {data.soil_analysis_and_tips.map((t, i) => (
            <p key={i} className="font-mono text-[12px] text-cream/70">• {t}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// Renders a session summary (pipe-separated key: value pairs) as neat tags
function SessionSummaryTags({ summary }) {
  const parts = summary.split(' | ').map(p => p.trim()).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {parts.map((part, i) => {
        const colonIdx = part.indexOf(':');
        if (colonIdx === -1) return (
          <span key={i} className="font-mono text-[12px] text-cream/70 bg-white/5 rounded-lg px-2 py-1">{part}</span>
        );
        const label = part.slice(0, colonIdx).trim();
        const value = part.slice(colonIdx + 1).trim();
        return (
          <span key={i} className="font-mono text-[12px] bg-white/5 rounded-lg px-2 py-1">
            <span className="text-cream/40">{label}: </span>
            <span className="text-cream/80">{value}</span>
          </span>
        );
      })}
    </div>
  );
}

// Detects if a string is the raw Gemini prompt (very long and starts with known markers)
function isRawPrompt(str) {
  if (!str) return false;
  if (str.length > 400) return true;
  if (str.startsWith('You are') || str.startsWith('\nYou are')) return true;
  return false;
}

export default function History() {
  const navigate = useNavigate();
  const farmer = JSON.parse(localStorage.getItem('farmer') || '{}');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiHistory(farmer.id);
      const data = res.data;
      setItems(Array.isArray(data) ? data : data.history || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [farmer.id]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  const handleRefresh = () => { setRefreshing(true); fetchHistory(); };

  return (
    <div className="bg-background min-h-screen text-cream">
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(111,255,0,0.02) 0%, transparent 60%)' }} />

      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between"
        style={{ background: 'rgba(1,8,40,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/home')}
          className="liquid-glass w-10 h-10 rounded-[10px] flex items-center justify-center text-cream hover:text-neon transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="text-center">
          <p className="font-condiment text-neon text-2xl leading-none">history</p>
          <h1 className="font-grotesk text-[13px] uppercase text-cream tracking-wider">Query History</h1>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="liquid-glass w-10 h-10 rounded-[10px] flex items-center justify-center text-cream hover:text-neon transition-colors">
          <RefreshCw size={16} className={refreshing ? 'spin-slow' : ''} />
        </button>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-neon/30 border-t-neon rounded-full spin-slow" />
            <p className="font-mono text-[12px] text-cream/40 uppercase tracking-widest">Loading history...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <p className="text-5xl">📝</p>
            <p className="font-grotesk text-xl text-cream uppercase">No History Yet</p>
            <p className="font-mono text-[12px] text-cream/40">Start asking questions to see your history here</p>
            <button onClick={() => navigate('/home')} className="ks-btn mt-4" style={{ width: 'auto', padding: '12px 32px' }}>
              Go Ask AI
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-mono text-[12px] text-cream/30 uppercase tracking-widest mb-2">{items.length} queries found</p>
            {items.map((item, idx) => {
              // Prefer user_summary; fall back for old records that only have the raw prompt
              const displayQuestion = item.user_summary
                ? item.user_summary
                : isRawPrompt(item.question)
                  ? null   // raw prompt — don't show it
                  : item.question;

              // Detect if this was a session (has pipe-separated key:value pairs)
              const isSession = displayQuestion && displayQuestion.includes(' | ') && displayQuestion.includes('Crop:');

              return (
                <div key={idx} className="liquid-glass rounded-[20px] p-5 border-l-2 border-neon/30">
                  {/* Badge row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="ks-badge bg-neon/10 text-neon">
                      {item.language || 'English'}
                    </span>
                    <span className="font-mono text-[11px] text-cream/30">
                      {item.created_at ? new Date(item.created_at).toLocaleString('en-IN') : ''}
                    </span>
                  </div>

                  {/* Question / Session summary */}
                  <div className="mb-2">
                    <p className="font-grotesk text-[11px] text-cream/40 uppercase tracking-widest mb-1">
                      {isSession ? '🌾 Farm Session' : '❓ Question'}
                    </p>
                    {displayQuestion ? (
                      isSession
                        ? <SessionSummaryTags summary={displayQuestion} />
                        : <p className="font-mono text-[13px] text-cream/80 leading-relaxed">{displayQuestion}</p>
                    ) : (
                      <p className="font-mono text-[12px] text-cream/30 italic">Session details not available</p>
                    )}
                  </div>

                  <AnswerBlock answer={item.answer} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}