import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin } from '../utils/api';
import Toast from '../components/Toast';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) { setToast({ message: 'Please fill all fields', type: 'error' }); return; }
    if (phone.length !== 10)  { setToast({ message: 'Phone number must be 10 digits', type: 'error' }); return; }
    setLoading(true);
    try {
      const res = await apiLogin({ phone, password });
      if (res.data.success) {
        localStorage.setItem('farmer', JSON.stringify({ id: res.data.farmer_id, name: res.data.name }));
        navigate('/home');
      } else {
        setToast({ message: res.data.message || 'Invalid credentials', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Network / server error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(111,255,0,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* Brand */}
        <div className="text-center mb-8">
          <p className="font-condiment text-neon text-5xl mb-0.5">Kisaan</p>
          <h1 className="font-grotesk text-3xl text-cream uppercase tracking-wider">Saathi</h1>
          <p className="font-mono text-[11px] text-cream/35 uppercase tracking-widest mt-2">
            AI-powered smart farming assistant
          </p>
          <p className="font-mono text-[10px] text-cream/20 mt-1">किसान एआई सहायक</p>
        </div>

        {/* Card */}
        <div className="liquid-glass rounded-[24px] p-6 md:p-8">
          <h2 className="font-grotesk text-lg text-cream uppercase mb-0.5">Welcome Back</h2>
          <p className="font-condiment text-neon text-2xl mb-6">Sign in to your farm</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-grotesk text-[10px] text-cream/40 uppercase tracking-widest block mb-2">
                Phone Number
              </label>
              <input
                type="tel" maxLength={10} value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="ks-input" placeholder="10-digit number"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="font-grotesk text-[10px] text-cream/40 uppercase tracking-widest block mb-2">
                Password
              </label>
              <input
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ks-input" placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="ks-btn mt-2">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="font-mono text-[12px] text-cream/40 text-center mt-5">
            New farmer?{' '}
            <Link to="/signup" className="text-neon hover:underline">Register here</Link>
          </p>
        </div>

      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}