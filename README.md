# Kisaan Saathi — AI Farming Assistant

AI-powered smart farming assistant for Indian farmers.
Built with React CRA (Orbis.NFT dark space theme) + Python FastAPI + MongoDB.

```
kisaan-saathi/
├── frontend/   — React CRA + Tailwind CSS (dark space theme)
└── backend/    — Python FastAPI + MongoDB (Motor async)
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- Gemini API key (Google AI Studio — free)
- OpenWeatherMap API key (free tier)

---

## Frontend

```bash
cd frontend
npm install
npm start          # http://localhost:3000
```

### Env (optional)
```
REACT_APP_API_URL=http://localhost:8000
```

---

## Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env       # fill in your keys

uvicorn main:app --reload --port 8000
# Swagger docs → http://localhost:8000/docs
```

### .env variables
| Variable               | Description                        |
|------------------------|------------------------------------|
| `MONGO_URI`            | MongoDB connection string          |
| `DB_NAME`              | Database name (default: kisaan_saathi) |
| `GEMINI_API_KEY`       | Google Gemini API key              |
| `OPENWEATHER_API_KEY`  | OpenWeatherMap API key             |
| `ALLOWED_ORIGINS`      | Comma-separated CORS origins       |

---

## API Endpoints

| Method | Path                   | Description                    |
|--------|------------------------|--------------------------------|
| POST   | `/signup`              | Register new farmer            |
| POST   | `/login`               | Farmer login                   |
| POST   | `/ask`                 | Ask AI a farming question      |
| POST   | `/session`             | Create farm session (soil/crop data → AI recs) |
| GET    | `/history/:farmer_id`  | Get query history              |
| GET    | `/weather?city=`       | Live weather + farming advice  |
| GET    | `/market?crop=`        | Live mandi/market prices       |
| GET    | `/docs`                | Swagger UI                     |

---

## Features
- **Login / Signup** — phone + password auth, stored in MongoDB
- **Ask AI** — farm session form (crop, soil type, NPK, pH, water, budget) → Gemini AI fertilizer recommendations
- **Multi-language** — English, Hindi, Marathi responses
- **Weather** — OpenWeatherMap live data + farming-specific advice
- **Market Prices** — data.gov.in mandi API with estimated fallback
- **Tips** — seasonal farming tips, soil health, government schemes
- **History** — full query history per farmer
- **Orbis.NFT Theme** — Anton + Condiment fonts, neon green (#6FFF00), liquid glass, dark navy (#010828)

---

## Deployment

### Frontend → Vercel / Netlify
```bash
cd frontend && npm run build
# Set REACT_APP_API_URL to your backend URL
```

### Backend → Railway / Render / Fly.io
```
Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### MongoDB → Atlas
Set `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net`
