import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, History } from 'lucide-react';

export default function Navbar({ farmerName }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('farmer');
    navigate('/login');
  };
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between md:px-6 md:py-4"
      style={{
        background: 'rgba(1,8,40,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand */}
      <div className="flex items-end gap-1.5">
        <span className="font-grotesk text-cream text-sm uppercase tracking-wider md:text-base">Kisaan</span>
        <span className="font-condiment text-neon text-lg md:text-xl ml-0.5">Saathi</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {farmerName && (
          <span className="hidden sm:block font-mono text-[11px] text-cream/45 uppercase tracking-widest max-w-[120px] truncate">
            {farmerName}
          </span>
        )}
        <button
          onClick={() => navigate('/history')}
          className="liquid-glass w-9 h-9 rounded-[10px] flex items-center justify-center text-cream/70 hover:text-neon transition-colors active:scale-95"
          title="Query History"
          aria-label="Query History"
        >
          <History size={15} />
        </button>
        <button
          onClick={handleLogout}
          className="liquid-glass w-9 h-9 rounded-[10px] flex items-center justify-center text-cream/70 hover:text-red-400 transition-colors active:scale-95"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={15} />
        </button>
      </div>
    </nav>
  );
}