import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup as apiSignup } from '../utils/api';
import Toast from '../components/Toast';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', phone: '', password: '', village: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) {
      setToast({ message: 'Please fill all required fields', type: 'error' }); return;
    }
    if (form.phone.length !== 10) {
      setToast({ message: 'Phone number must be 10 digits', type: 'error' }); return;
    }
    setLoading(true);
    try {
      const res = await apiSignup(form);
      if (res.data.success) {
        setToast({ message: 'Registration successful! Please login.', type: 'success' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setToast({ message: res.data.message || 'Signup failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Network / server error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full Name *',        name: 'name',     type: 'text',     placeholder: 'Your name' },
    { label: 'Phone Number *',     name: 'phone',    type: 'tel',      placeholder: '10-digit number', maxLength: 10, inputMode: 'numeric' },
    { label: 'Password *',         name: 'password', type: 'password', placeholder: '••••••••' },
    { label: 'Village (optional)', name: 'village',  type: 'text',     placeholder: 'Village name' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(111,255,0,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative z-10">

        <div className="text-center mb-7">
          <p className="font-condiment text-neon text-4xl mb-0.5">Kisaan Saathi</p>
          <h1 className="font-grotesk text-2xl text-cream uppercase">Farmer Registration</h1>
          <p className="font-mono text-[10px] text-cream/25 mt-1">किसान पंजीकरण</p>
        </div>

        <div className="liquid-glass rounded-[24px] p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="font-grotesk text-[10px] text-cream/40 uppercase tracking-widest block mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  maxLength={field.maxLength}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  inputMode={field.inputMode}
                  className="ks-input"
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="ks-btn mt-2">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="font-mono text-[12px] text-cream/40 text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-neon hover:underline">Login</Link>
          </p>
        </div>

      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}