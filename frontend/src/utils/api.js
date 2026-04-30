import axios from 'axios';

const API_BASE = 'https://ksaathi-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;

export const login    = (data)           => api.post('/login',   data);
export const signup   = (data)           => api.post('/signup',  data);
export const ask      = (data)           => api.post('/ask',     data);
export const session  = (data)           => api.post('/session', data);
export const history  = (farmerId)       => api.get(`/history/${farmerId}`);
export const weather  = (city)           => api.get(`/weather?city=${encodeURIComponent(city)}`);
export const market   = (crop)           => api.get(`/market?crop=${encodeURIComponent(crop)}`);
