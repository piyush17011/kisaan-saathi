# Project context: kisaan-saathi
Generated: 2026-05-02 · 36 files · stripped: comments, blank_lines, console_logs

---

## Project structure

```
kisaan-saathi/
├── README.md
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── settings.py
│   ├── main.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── helpers.py
│   │   └── schemas.py
│   └── routes/
│       ├── __init__.py
│       ├── ai.py
│       ├── auth.py
│       ├── crop_validator.py
│       ├── market.py
│       └── weather.py
├── frontend/
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── AskTab.js
│   │   │   ├── FeaturesSection.js
│   │   │   ├── MarketTab.js
│   │   │   ├── Navbar.js
│   │   │   ├── TipsTab.js
│   │   │   ├── Toast.js
│   │   │   └── WeatherTab.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── pages/
│   │   │   ├── History.js
│   │   │   ├── Home.js
│   │   │   ├── LandingPage.js
│   │   │   ├── Login.js
│   │   │   └── Signup.js
│   │   └── utils/
│   │       ├── api.js
│   │       └── i18n.js
│   └── tailwind.config.js
└── test_gemini.py
```

---

## Files

### `README.md`

```md
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
```

### `backend/config/__init__.py`

```python

```

### `backend/config/database.py`

```python
from pymongo import MongoClient, ASCENDING
from config.settings import settings
client = None
db = None
def connect_db():
    global client, db
    client = MongoClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    db.farmers.create_index("phone", unique=True)
    db.queries.create_index("farmer_id")
    db.queries.create_index("created_at")
    db.sessions.create_index("farmer_id")
def close_db():
    global client
    if client:
        client.close()
def get_db():
    return db
```

### `backend/config/settings.py`

```python
import os
from dotenv import load_dotenv
load_dotenv()
class Settings:
    def __init__(self):
        self.MONGO_URI: str           = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.DB_NAME: str             = os.getenv("DB_NAME", "kisaan_saathi")
        self.GEMINI_API_KEY: str      = os.getenv("GEMINI_API_KEY", "")
        self.OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
        self.DATAGOV_API_KEY: str     = os.getenv("DATAGOV_API_KEY", "")
        self.SECRET_KEY: str          = os.getenv("SECRET_KEY", "change-me-in-production")
        self.PORT: int                = int(os.getenv("PORT", 8000))
        self.ALLOWED_ORIGINS: str     = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
settings = Settings()
```

### `backend/main.py`

```python
from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import settings
from config.database import connect_db
from routes.auth import auth_bp
from routes.ai import ai_bp
from routes.weather import weather_bp
from routes.market import market_bp
app = Flask(__name__)
CORS(app, origins=settings.origins, supports_credentials=True)
connect_db()
app.register_blueprint(auth_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(weather_bp)
app.register_blueprint(market_bp)
@app.get("/")
def root():
    return jsonify({"name": "Kisaan Saathi API", "version": "1.0.0", "docs": "/docs"})
@app.get("/ping")
def ping():
    return jsonify({"status": "ok"})
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=settings.PORT, debug=False)
```

### `backend/models/__init__.py`

```python

```

### `backend/models/helpers.py`

```python
from bson import ObjectId
def doc(d):
    if d is None:
        return None
    out = {}
    for k, v in d.items():
        if k == "_id":
            out["id"] = str(v)
        elif isinstance(v, ObjectId):
            out[k] = str(v)
        else:
            out[k] = v
    return out
def docs(lst):
    return [doc(d) for d in lst]
```

### `backend/models/schemas.py`

```python
from pydantic import BaseModel
from typing import Optional
class SignupRequest(BaseModel):
    name: str
    phone: str
    password: str
    village: Optional[str] = None
class LoginRequest(BaseModel):
    phone: str
    password: str
class AskRequest(BaseModel):
    farmer_id: str
    question: str
    language: str = "English"
class SessionRequest(BaseModel):
    farmer_id: str
    crop: str
    farmer_problem: Optional[str] = None
    extra_description: Optional[str] = None
    location: Optional[str] = None
    soil_type: Optional[str] = "Loamy"
    ph: Optional[float] = 6.5
    nitrogen_ppm: Optional[int] = 0
    phosphorus_ppm: Optional[int] = 0
    potassium_ppm: Optional[int] = 0
    water_availability: Optional[str] = "Moderate"
    budget_range: Optional[str] = "Medium"
    language: str = "English"
```

### `backend/routes/__init__.py`

```python

```

### `backend/routes/ai.py`

```python
from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import traceback
import re
import google.generativeai as genai
from config.database import get_db
from config.settings import settings
ai_bp = Blueprint("ai", __name__)
LANG_MAP = {
    "English": "English",
    "Hindi": "Hindi",
    "Marathi": "Marathi",
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
}
def clean_json_response(raw: str):
    if not raw:
        return None
    raw = raw.replace("```json", "").replace("```", "").strip()
    raw = re.sub(r"[\x00-\x1F\x7F]", "", raw)
    try:
        return json.loads(raw)
    except Exception:
        return None
def call_gemini(prompt: str) -> str:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash-lite")
    response = model.generate_content(prompt)
    return response.text.strip()
ASK_PROMPT = """
You are an experienced Indian agricultural expert speaking directly to a farmer.
FARMER'S QUESTION: {question}
RESPOND IN: {lang}
First, decide if this is a real, answerable farming question.
- If the input is gibberish, abusive, completely off-topic, or impossible to answer as farming advice,
  set "invalid" to true and put a short, friendly callout in "error_message" (in {lang}).
- If it IS a valid farming question, set "invalid" to false and fill the other fields.
Use your own agricultural knowledge. Do NOT use generic filler text.
Base fertilizer names, quantities, timings, and tips on what actually makes sense
for THIS specific question — location, crop, season, soil if mentioned.
Respond ONLY with this JSON (no markdown, no extra text):
{
  "invalid": false,
  "error_message": "",
  "overall_analysis": "Detailed, practical answer in simple language. Step-by-step where needed.",
  "fertilizers": [
    {
      "name": "actual fertilizer name relevant to this query",
      "quantity_per_acre": "specific quantity",
      "when_to_apply": "specific timing",
      "why": "one simple sentence explaining why this helps"
    }
  ],
  "tips": [
    "Specific, actionable tip relevant to THIS question",
    "COMMON MISTAKE farmers make in this exact situation",
    "One easy trick or cost-saving idea"
  ],
  "when_to_call_expert": "Tell farmer when to stop DIY and call a Krishi Sevak or agriculture officer"
}
"""
SESSION_PROMPT = """
You are an experienced Indian agricultural expert. A farmer has submitted their farm details.
Your job: give them a UNIQUE, SPECIFIC farming plan based only on what they told you.
RESPOND IN: {lang}
--- FARMER INPUT ---
Crop they want to grow : {crop}
Their location         : {location}
Main problem           : {farmer_problem}
Extra details          : {extra_description}
Soil type              : {soil_type}
Soil pH                : {ph}
Nitrogen (ppm)         : {nitrogen_ppm}
Phosphorus (ppm)       : {phosphorus_ppm}
Potassium (ppm)        : {potassium_ppm}
Water availability     : {water_availability}
Budget                 : {budget_range}
--------------------
STEP 1 — VALIDATE THE INPUT FIRST.
Check all fields together. If the input is nonsensical, clearly fake, abusive, or impossible
(e.g. crop = "asdfgh", location = "mars", pH = 99, a mix of random words),
set "invalid" to true and write a clear, friendly callout in "error_message" (in {lang})
telling the farmer exactly what seems wrong and asking them to correct it.
Do NOT try to answer invalid input — just call it out.
STEP 2 — IF VALID, use your agricultural knowledge to answer.
- You know which crops grow in which Indian states, what soil they need, what rainfall they require.
  Use that knowledge. Do NOT say "I cannot determine" — you know Indian agriculture.
- If the crop is genuinely unsuitable for that location (e.g. apple in coastal Kerala),
  say so clearly, explain WHY in simple terms, and suggest 2-3 better crops for that region.
- If the crop CAN grow there but needs special care, mention that honestly.
- Fertilizer names, quantities, and timings must be SPECIFIC to this crop + soil data.
  If NPK values are given, factor them into your recommendation (e.g. if N is already high, say so).
- Every tip must be relevant to THIS farmer's actual situation, not generic advice.
Respond ONLY with this JSON (no markdown, no extra text):
{
  "invalid": false,
  "error_message": "",
  "crop_suitability": {
    "is_suitable": true,
    "verdict": "One clear sentence: is this crop a good, risky, or bad choice here?",
    "reason": "Why — based on region climate, soil, rainfall. Use your knowledge.",
    "suggested_alternatives": []
  },
  "overall_analysis": "Full farming plan in simple language, step by step, for THIS farmer.",
  "fertilizers": [
    {
      "name": "specific fertilizer name",
      "quantity_per_acre": "specific amount",
      "when_to_apply": "specific stage or month",
      "why": "one sentence — why this is needed given the soil data above"
    }
  ],
  "tips": [
    "Specific tip for THIS crop + location + problem",
    "COMMON MISTAKE for this crop in this region",
    "Water/budget tip matching their constraints"
  ],
  "timeline": {
    "land_prep": "when and what to do",
    "sowing": "best sowing window for this crop in this region",
    "key_stages": "brief milestones",
    "harvest": "expected harvest window"
  },
  "when_to_call_expert": "Specific signs that mean this farmer should call a Krishi Sevak"
}
"""
@ai_bp.post("/ask")
def ask():
    db = get_db()
    payload = request.get_json(silent=True) or {}
    farmer_id = payload.get("farmer_id", "").strip()
    question  = payload.get("question", "").strip()
    language  = payload.get("language", "English")
    lang      = LANG_MAP.get(language, "English")
    if not farmer_id:
        return jsonify({"detail": "farmer_id is required"}), 400
    if not question:
        return jsonify({"detail": "question cannot be empty"}), 400
    try:
        raw    = call_gemini(ASK_PROMPT.format(question=question, lang=lang))
        result = clean_json_response(raw)
        if not result:
            return jsonify({"detail": "AI returned an unexpected response. Please try again."}), 502
    except Exception as e:
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500
    if result.get("invalid"):
        return jsonify({
            "success": False,
            "invalid_input": True,
            "message": result.get("error_message", "Your question does not seem like a farming question. Please try again.")
        }), 400
    db.queries.insert_one({
        "farmer_id":  farmer_id,
        "question":   question,
        "answer":     result,
        "language":   language,
        "created_at": datetime.utcnow(),
    })
    return jsonify({"success": True, "answer": result})
@ai_bp.post("/session")
def session():
    db = get_db()
    payload = request.get_json(silent=True) or {}
    farmer_id         = payload.get("farmer_id", "").strip()
    crop              = payload.get("crop", "").strip()
    location          = payload.get("location", "").strip()
    farmer_problem    = payload.get("farmer_problem", "").strip()
    extra_description = payload.get("extra_description", "").strip()
    soil_type         = payload.get("soil_type", "Not specified")
    ph                = payload.get("ph", "Not specified")
    nitrogen_ppm      = payload.get("nitrogen_ppm", "Not specified")
    phosphorus_ppm    = payload.get("phosphorus_ppm", "Not specified")
    potassium_ppm     = payload.get("potassium_ppm", "Not specified")
    water_availability = payload.get("water_availability", "Moderate")
    budget_range      = payload.get("budget_range", "Medium")
    language          = payload.get("language", "English")
    lang              = LANG_MAP.get(language, "English")
    if not farmer_id:
        return jsonify({"detail": "farmer_id is required"}), 400
    if not crop:
        return jsonify({"detail": "crop is required"}), 400
    try:
        prompt = SESSION_PROMPT.format(
            lang=lang,
            crop=crop,
            location=location or "Not specified",
            farmer_problem=farmer_problem or "Not specified",
            extra_description=extra_description or "Not specified",
            soil_type=soil_type,
            ph=ph,
            nitrogen_ppm=nitrogen_ppm,
            phosphorus_ppm=phosphorus_ppm,
            potassium_ppm=potassium_ppm,
            water_availability=water_availability,
            budget_range=budget_range,
        )
        raw    = call_gemini(prompt)
        result = clean_json_response(raw)
        if not result:
            return jsonify({"detail": "AI returned an unexpected response. Please try again."}), 502
    except Exception:
        return jsonify({"detail": "AI service temporarily unavailable."}), 503
    if result.get("invalid"):
        return jsonify({
            "success": False,
            "invalid_input": True,
            "message": result.get("error_message", "Some of your inputs do not look right. Please check and try again.")
        }), 400
    db.sessions.insert_one({
        "farmer_id":         farmer_id,
        "crop":              crop,
        "location":          location,
        "farmer_problem":    farmer_problem,
        "extra_description": extra_description,
        "soil_type":         soil_type,
        "ph":                ph,
        "nitrogen_ppm":      nitrogen_ppm,
        "phosphorus_ppm":    phosphorus_ppm,
        "potassium_ppm":     potassium_ppm,
        "water_availability": water_availability,
        "budget_range":      budget_range,
        "recommendation":    result,
        "created_at":        datetime.utcnow(),
    })
    db.queries.insert_one({
        "farmer_id":  farmer_id,
        "question":   f"Session: {crop} in {location}",
        "answer":     result,
        "language":   language,
        "created_at": datetime.utcnow(),
    })
    return jsonify({"success": True, "answer": result})
@ai_bp.get("/history/<farmer_id>")
def get_history(farmer_id: str):
    db = get_db()
    rows = list(
        db.queries
        .find({"farmer_id": farmer_id})
        .sort("created_at", -1)
        .limit(50)
    )
    result = []
    for r in rows:
        r = dict(r)
        r["id"] = str(r.pop("_id"))
        if "created_at" in r:
            r["created_at"] = r["created_at"].isoformat()
        result.append(r)
    return jsonify(result)
```

### `backend/routes/auth.py`

```python
from flask import Blueprint, request, jsonify
from datetime import datetime
from config.database import get_db
from models.helpers import doc
auth_bp = Blueprint("auth", __name__)
@auth_bp.post("/signup")
def signup():
    db = get_db()
    payload = request.get_json()
    name = payload.get("name")
    phone = payload.get("phone")
    password = payload.get("password")
    village = payload.get("village")
    if not name or not phone or not password:
        return jsonify({"detail": "name, phone, and password are required"}), 400
    existing = db.farmers.find_one({"phone": phone})
    if existing:
        return jsonify({"detail": "Phone already registered"}), 400
    data = {
        "name": name,
        "phone": phone,
        "password": password,
        "village": village,
        "created_at": datetime.utcnow(),
    }
    result = db.farmers.insert_one(data)
    return jsonify({"success": True, "id": str(result.inserted_id)}), 201
@auth_bp.post("/login")
def login():
    db = get_db()
    payload = request.get_json()
    phone = payload.get("phone")
    password = payload.get("password")
    if not phone or not password:
        return jsonify({"detail": "phone and password are required"}), 400
    farmer = db.farmers.find_one({"phone": phone, "password": password})
    if not farmer:
        return jsonify({"detail": "Invalid credentials"}), 401
    return jsonify({"success": True, "farmer_id": str(farmer["_id"]), "name": farmer["name"]})
```

### `backend/routes/crop_validator.py`

```python
"""
Crop Validator Module - Validates crop suitability for regions
Prevents farmers from growing unsuitable crops in their area
"""

from typing import Dict, List, Tuple


CROP_REGION_DATABASE = {
    "Punjab": {
        "suitable_crops": ["Wheat", "Rice", "Cotton", "Sugarcane", "Maize", "Mustard", "Barley"],
        "climate_zone": "Subtropical",
        "avg_rainfall": "500-700mm",
        "soil_type": "Alluvial",
        "season": ["Rabi", "Kharif"]
    },
    "Haryana": {
        "suitable_crops": ["Wheat", "Rice", "Cotton", "Sugarcane", "Maize", "Mustard", "Barley"],
        "climate_zone": "Subtropical",
        "avg_rainfall": "500-700mm",
        "soil_type": "Alluvial",
        "season": ["Rabi", "Kharif"]
    },
    "Uttar Pradesh": {
        "suitable_crops": ["Wheat", "Rice", "Sugarcane", "Maize", "Potato", "Mustard", "Lentil", "Mango"],
        "climate_zone": "Subtropical",
        "avg_rainfall": "600-900mm",
        "soil_type": "Alluvial",
        "season": ["Rabi", "Kharif"]
    },
    "Bihar": {
        "suitable_crops": ["Rice", "Wheat", "Lentil", "Maize", "Potato", "Mustard", "Litchi", "Mango"],
        "climate_zone": "Subtropical",
        "avg_rainfall": "800-1200mm",
        "soil_type": "Alluvial/Clay",
        "season": ["Rabi", "Kharif"]
    },
    "West Bengal": {
        "suitable_crops": ["Rice", "Jute", "Tea", "Potato", "Onion", "Mango", "Mustard"],
        "climate_zone": "Tropical",
        "avg_rainfall": "1000-1500mm",
        "soil_type": "Alluvial",
        "season": ["Rabi", "Kharif"]
    },
    "Karnataka": {
        "suitable_crops": ["Coffee", "Tea", "Sugarcane", "Cotton", "Groundnut", "Mango", "Coconut", "Ragi", "Jowar"],
        "climate_zone": "Tropical/Subtropical",
        "avg_rainfall": "600-1000mm",
        "soil_type": "Red Soil",
        "season": ["Rabi", "Kharif", "Summer"]
    },
    "Tamil Nadu": {
        "suitable_crops": ["Sugarcane", "Cotton", "Groundnut", "Rice", "Coconut", "Banana", "Mango", "Turmeric"],
        "climate_zone": "Tropical",
        "avg_rainfall": "500-1000mm",
        "soil_type": "Black Soil/Red Soil",
        "season": ["Kharif", "Rabi"]
    },
    "Andhra Pradesh": {
        "suitable_crops": ["Rice", "Sugarcane", "Cotton", "Groundnut", "Chili", "Mango", "Tobacco", "Turmeric"],
        "climate_zone": "Tropical/Subtropical",
        "avg_rainfall": "700-1100mm",
        "soil_type": "Red Soil/Black Soil",
        "season": ["Kharif", "Rabi"]
    },
    "Telangana": {
        "suitable_crops": ["Cotton", "Sugarcane", "Rice", "Groundnut", "Chili", "Mango", "Turmeric"],
        "climate_zone": "Subtropical",
        "avg_rainfall": "700-900mm",
        "soil_type": "Black Soil/Red Soil",
        "season": ["Kharif", "Rabi"]
    },
    "Maharashtra": {
        "suitable_crops": [
            "Sugarcane", "Cotton", "Jowar", "Wheat", "Groundnut",
            "Mango", "Grapes", "Banana", "Cashew", "Orange",
            "Pomegranate", "Onion", "Tomato", "Soybean", "Tur Dal"
        ],
        "climate_zone": "Subtropical",
        "avg_rainfall": "500-3000mm",
        "soil_type": "Black Soil / Laterite (Konkan)",
        "season": ["Kharif", "Rabi", "Summer"]
    },
    "Gujarat": {
        "suitable_crops": ["Cotton", "Groundnut", "Maize", "Wheat", "Sugarcane", "Mango", "Banana", "Dates"],
        "climate_zone": "Arid/Subtropical",
        "avg_rainfall": "400-800mm",
        "soil_type": "Sandy/Loamy",
        "season": ["Kharif", "Rabi"]
    },
    "Rajasthan": {
        "suitable_crops": ["Wheat", "Mustard", "Groundnut", "Maize", "Barley", "Bajra", "Moth Bean"],
        "climate_zone": "Arid",
        "avg_rainfall": "200-600mm",
        "soil_type": "Sandy",
        "season": ["Rabi"]
    },
    "Madhya Pradesh": {
        "suitable_crops": ["Wheat", "Soybean", "Cotton", "Sugarcane", "Maize", "Lentil", "Gram", "Jowar"],
        "climate_zone": "Subtropical",
        "avg_rainfall": "700-1200mm",
        "soil_type": "Black Soil/Alluvial",
        "season": ["Rabi", "Kharif"]
    },
    "Himachal Pradesh": {
        "suitable_crops": ["Wheat", "Barley", "Apple", "Apricot", "Potato", "Pear", "Cherry"],
        "climate_zone": "Temperate",
        "avg_rainfall": "800-1500mm",
        "soil_type": "Loamy",
        "season": ["Rabi", "Summer"]
    },
    "Uttarakhand": {
        "suitable_crops": ["Wheat", "Rice", "Potato", "Apple", "Ginger", "Mandarin", "Litchi"],
        "climate_zone": "Temperate/Subtropical",
        "avg_rainfall": "1000-1500mm",
        "soil_type": "Loamy",
        "season": ["Rabi", "Kharif"]
    },
    "Kerala": {
        "suitable_crops": ["Coconut", "Spices", "Rubber", "Tea", "Arecanut", "Banana", "Pepper", "Cashew"],
        "climate_zone": "Tropical",
        "avg_rainfall": "2000-3000mm",
        "soil_type": "Laterite",
        "season": ["Kharif", "Summer"]
    },
    "Goa": {
        "suitable_crops": ["Cashew", "Coconut", "Rice", "Mango", "Banana", "Areca nut", "Pepper"],
        "climate_zone": "Tropical",
        "avg_rainfall": "2500-3000mm",
        "soil_type": "Laterite",
        "season": ["Kharif"]
    },
    "Odisha": {
        "suitable_crops": ["Rice", "Maize", "Groundnut", "Sugarcane", "Jute", "Turmeric", "Ginger"],
        "climate_zone": "Tropical",
        "avg_rainfall": "1200-1700mm",
        "soil_type": "Red/Alluvial",
        "season": ["Kharif", "Rabi"]
    },
    "Jharkhand": {
        "suitable_crops": ["Rice", "Maize", "Wheat", "Potato", "Tomato", "Mustard", "Litchi"],
        "climate_zone": "Subtropical",
        "avg_rainfall": "1000-1400mm",
        "soil_type": "Red Laterite",
        "season": ["Kharif", "Rabi"]
    },
    "Chhattisgarh": {
        "suitable_crops": ["Rice", "Maize", "Soybean", "Groundnut", "Lentil", "Tomato"],
        "climate_zone": "Subtropical",
        "avg_rainfall": "900-1400mm",
        "soil_type": "Red/Sandy Loam",
        "season": ["Kharif", "Rabi"]
    },
    "Unknown": {
        "suitable_crops": ["Wheat", "Rice", "Maize", "Tomato", "Onion"],
        "climate_zone": "Temperate",
        "avg_rainfall": "500mm",
        "soil_type": "Loamy",
        "season": ["Rabi", "Kharif"]
    }
}

CROP_DATABASE = {
    "Wheat": {
        "water_requirement": "Low-Moderate",
        "season": "Rabi",
        "rainfall": "500-750mm",
        "suitable_regions": ["Punjab", "Haryana", "Uttar Pradesh", "Bihar", "Madhya Pradesh"],
        "temp_range": "15-25°C",
        "soil_type": "Loamy, Well-drained"
    },
    "Rice": {
        "water_requirement": "High",
        "season": "Kharif",
        "rainfall": "1000-1500mm",
        "suitable_regions": ["Punjab", "Haryana", "Bihar", "West Bengal", "Andhra Pradesh", "Tamil Nadu"],
        "temp_range": "20-30°C",
        "soil_type": "Clay, Alluvial"
    },
    "Cotton": {
        "water_requirement": "Moderate",
        "season": "Kharif",
        "rainfall": "600-1000mm",
        "suitable_regions": ["Punjab", "Haryana", "Gujarat", "Maharashtra", "Karnataka", "Andhra Pradesh"],
        "temp_range": "21-30°C",
        "soil_type": "Black soil, Well-drained"
    },
    "Sugarcane": {
        "water_requirement": "High",
        "season": "Year-round",
        "rainfall": "750-1000mm",
        "suitable_regions": ["Punjab", "Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", "Andhra Pradesh"],
        "temp_range": "20-30°C",
        "soil_type": "Loamy, Fertile"
    },
    "Maize": {
        "water_requirement": "Moderate",
        "season": "Kharif/Rabi",
        "rainfall": "500-750mm",
        "suitable_regions": ["Punjab", "Haryana", "Uttar Pradesh", "Gujarat", "Karnataka"],
        "temp_range": "18-27°C",
        "soil_type": "Well-drained loamy"
    },
    "Tomato": {
        "water_requirement": "Moderate",
        "season": "Summer/Winter",
        "rainfall": "400-600mm",
        "suitable_regions": ["Karnataka", "Maharashtra", "Andhra Pradesh", "Rajasthan", "Madhya Pradesh"],
        "temp_range": "20-25°C",
        "soil_type": "Loamy, Well-drained"
    },
    "Onion": {
        "water_requirement": "Low-Moderate",
        "season": "Kharif/Rabi",
        "rainfall": "400-600mm",
        "suitable_regions": ["Maharashtra", "Gujarat", "Rajasthan", "Karnataka", "Madhya Pradesh"],
        "temp_range": "15-25°C",
        "soil_type": "Loamy, Well-drained"
    },
    "Groundnut": {
        "water_requirement": "Moderate",
        "season": "Kharif",
        "rainfall": "400-600mm",
        "suitable_regions": ["Gujarat", "Karnataka", "Andhra Pradesh", "Tamil Nadu", "Rajasthan", "Maharashtra"],
        "temp_range": "20-28°C",
        "soil_type": "Loamy, Well-drained"
    },
    "Lentil": {
        "water_requirement": "Low",
        "season": "Rabi",
        "rainfall": "400-500mm",
        "suitable_regions": ["Madhya Pradesh", "Bihar", "Uttar Pradesh", "Rajasthan"],
        "temp_range": "15-20°C",
        "soil_type": "Well-drained loamy"
    },
    "Potato": {
        "water_requirement": "Moderate",
        "season": "Rabi/Summer",
        "rainfall": "400-600mm",
        "suitable_regions": ["Uttar Pradesh", "Bihar", "Punjab", "West Bengal", "Himachal Pradesh"],
        "temp_range": "15-20°C",
        "soil_type": "Well-drained loamy"
    },
    "Mango": {
        "water_requirement": "Low-Moderate",
        "season": "Summer (fruit)",
        "rainfall": "750-2500mm",
        "suitable_regions": [
            "Maharashtra", "Uttar Pradesh", "Andhra Pradesh", "Telangana",
            "Karnataka", "Bihar", "Gujarat", "Tamil Nadu", "West Bengal", "Goa"
        ],
        "temp_range": "24-27°C",
        "soil_type": "Well-drained loamy / Laterite"
    },
    "Grapes": {
        "water_requirement": "Moderate",
        "season": "Rabi/Summer",
        "rainfall": "600-800mm",
        "suitable_regions": ["Maharashtra", "Karnataka", "Andhra Pradesh", "Tamil Nadu"],
        "temp_range": "15-35°C",
        "soil_type": "Sandy loam, Well-drained"
    },
    "Banana": {
        "water_requirement": "High",
        "season": "Year-round",
        "rainfall": "1200-2500mm",
        "suitable_regions": ["Maharashtra", "Tamil Nadu", "Karnataka", "Gujarat", "Kerala", "Andhra Pradesh"],
        "temp_range": "25-35°C",
        "soil_type": "Loamy, Fertile"
    },
    "Cashew": {
        "water_requirement": "Low-Moderate",
        "season": "Summer (fruit)",
        "rainfall": "1000-2000mm",
        "suitable_regions": ["Maharashtra", "Goa", "Kerala", "Karnataka", "Andhra Pradesh", "Odisha"],
        "temp_range": "20-35°C",
        "soil_type": "Laterite, Sandy loam"
    },
    "Orange": {
        "water_requirement": "Moderate",
        "season": "Winter (fruit)",
        "rainfall": "750-1500mm",
        "suitable_regions": ["Maharashtra", "Madhya Pradesh", "Rajasthan", "Punjab"],
        "temp_range": "13-37°C",
        "soil_type": "Well-drained loamy"
    },
    "Pomegranate": {
        "water_requirement": "Low-Moderate",
        "season": "Year-round",
        "rainfall": "500-800mm",
        "suitable_regions": ["Maharashtra", "Karnataka", "Gujarat", "Andhra Pradesh", "Rajasthan"],
        "temp_range": "25-35°C",
        "soil_type": "Well-drained loamy"
    },
    "Coconut": {
        "water_requirement": "High",
        "season": "Year-round",
        "rainfall": "1500-2500mm",
        "suitable_regions": ["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Goa", "Maharashtra"],
        "temp_range": "27-32°C",
        "soil_type": "Sandy loam, Laterite"
    },
    "Soybean": {
        "water_requirement": "Moderate",
        "season": "Kharif",
        "rainfall": "600-900mm",
        "suitable_regions": ["Maharashtra", "Madhya Pradesh", "Rajasthan", "Karnataka"],
        "temp_range": "20-30°C",
        "soil_type": "Black soil, Loamy"
    },
    "Jowar": {
        "water_requirement": "Low",
        "season": "Kharif/Rabi",
        "rainfall": "400-600mm",
        "suitable_regions": ["Maharashtra", "Karnataka", "Andhra Pradesh", "Madhya Pradesh"],
        "temp_range": "25-30°C",
        "soil_type": "Black soil"
    },
}

CROP_ALIASES = {
    "alphonso": "Mango",
    "hapus": "Mango",
    "kesar mango": "Mango",
    "aam": "Mango",
    "केळी": "Banana",
    "kela": "Banana",
    "द्राक्षे": "Grapes",
    "draksha": "Grapes",
    "काजू": "Cashew",
    "kaju": "Cashew",
    "संत्रा": "Orange",
    "santra": "Orange",
    "डाळिंब": "Pomegranate",
    "dalimb": "Pomegranate",
}


def normalize_crop(crop: str) -> str:
    """Normalize crop name — handle aliases and capitalisation."""
    lower = crop.lower().strip()
    if lower in CROP_ALIASES:
        return CROP_ALIASES[lower]
    for known in list(CROP_DATABASE.keys()):
        if lower == known.lower():
            return known
    return crop  


def extract_region(location: str) -> str:
    """
    Extract state from a location string.
    Handles formats like:
      - "Ratnagiri, Maharashtra"      → "Maharashtra"
      - ", Maharashtra"               → "Maharashtra"
      - "Maharashtra"                 → "Maharashtra"
      - "Pune District, Maharashtra"  → "Maharashtra"
    Falls back to checking if any part matches a known state.
    """
    if not location or not location.strip():
        return "Unknown"

    parts = [p.strip() for p in location.split(",") if p.strip()]

    if not parts:
        return "Unknown"

    for part in reversed(parts):
        for key in CROP_REGION_DATABASE.keys():
            if key == "Unknown":
                continue
            if key.lower() in part.lower() or part.lower() in key.lower():
                return key

    return "Unknown"


def validate_crop_for_region(crop: str, location: str) -> Tuple[bool, Dict]:
    """
    Validate if a crop is suitable for a given region.
    Returns: (is_suitable, details_dict)
    """
    crop = normalize_crop(crop)
    region = extract_region(location)
    region_data = CROP_REGION_DATABASE.get(region, CROP_REGION_DATABASE["Unknown"])
    crop_data = CROP_DATABASE.get(crop, None)

    suitable_crops = region_data.get("suitable_crops", [])
    is_suitable = crop.lower() in [c.lower() for c in suitable_crops]

    if not is_suitable and crop_data:
        crop_suitable_regions = crop_data.get("suitable_regions", [])
        is_suitable = any(region.lower() in r.lower() or r.lower() in region.lower()
                          for r in crop_suitable_regions)

    details = {
        "crop": crop,
        "region": region,
        "is_suitable": is_suitable,
        "region_info": {
            "climate_zone": region_data.get("climate_zone"),
            "avg_rainfall": region_data.get("avg_rainfall"),
            "soil_type": region_data.get("soil_type"),
            "suitable_crops": region_data.get("suitable_crops", [])
        },
        "crop_info": crop_data or {},
        "warning": "",
        "suggestion": ""
    }

    if not is_suitable:
        details["warning"] = (
            f"⚠️ {crop} is NOT typically grown in {region}. "
            f"This crop may not thrive in this region's climate and soil."
        )
        alternative_crops = region_data.get("suitable_crops", [])
        if alternative_crops:
            details["suggestion"] = (
                f"💡 We recommend growing: {', '.join(alternative_crops[:3])} "
                f"which are well-suited for {region}."
            )
    else:
        details["warning"] = f"✅ {crop} is a good choice for {region}!"

    return is_suitable, details


def get_suitable_crops_for_region(location: str) -> List[str]:
    """Get all suitable crops for a given region."""
    region = extract_region(location)
    region_data = CROP_REGION_DATABASE.get(region, CROP_REGION_DATABASE["Unknown"])
    return region_data.get("suitable_crops", [])


def get_water_compatibility(crop: str, water_availability: str) -> Tuple[bool, str]:
    """Check if water availability matches crop requirements."""
    crop = normalize_crop(crop)
    crop_data = CROP_DATABASE.get(crop, {})
    water_req = crop_data.get("water_requirement", "").lower()

    compatibility_map = {
        "low": ["low", "low-moderate"],
        "moderate": ["low-moderate", "moderate", "moderate-high"],
        "high": ["moderate-high", "high"]
    }

    water_key = water_availability.lower()
    compatible = any(req in water_req for req in compatibility_map.get(water_key, []))

    if not water_req:
        return True, f"✅ Proceeding with {water_availability} water availability."

    if compatible:
        message = f"✅ Water availability ({water_availability}) is suitable for {crop}"
    else:
        message = (
            f"⚠️ {crop} requires {water_req} water, but you have {water_availability} availability. "
            f"You may need irrigation."
        )

    return compatible, message


def generate_crop_warning_message(crop: str, location: str, language: str = "English") -> str:
    """Generate a user-friendly warning message in the specified language."""
    crop = normalize_crop(crop)
    is_suitable, details = validate_crop_for_region(crop, location)

    warnings = {
        "English": {
            "unsuitable": (
                f"⚠️ WARNING: {crop} is not commonly grown in {details['region']}. "
                f"This crop may struggle due to:\n"
                f"• Climate: {details['region_info']['climate_zone']}\n"
                f"• Rainfall: {details['region_info']['avg_rainfall']}\n"
                f"• Soil: {details['region_info']['soil_type']}\n\n"
                f"Better options: {', '.join(details['region_info']['suitable_crops'][:3])}"
            ),
            "suitable": f"✅ GOOD: {crop} is well-suited for {details['region']}!"
        },
        "Hindi": {
            "unsuitable": (
                f"⚠️ सावधानी: {crop} को {details['region']} में आमतौर पर नहीं उगाया जाता है। "
                f"बेहतर विकल्प: {', '.join(details['region_info']['suitable_crops'][:3])}"
            ),
            "suitable": f"✅ अच्छा: {crop} {details['region']} के लिए उपयुक्त है!"
        },
        "Marathi": {
            "unsuitable": (
                f"⚠️ सावधान: {crop} सामान्यतः {details['region']} मध्ये वाढविले जात नाही। "
                f"उत्तम पर्याय: {', '.join(details['region_info']['suitable_crops'][:3])}"
            ),
            "suitable": f"✅ छान: {crop} {details['region']} साठी योग्य आहे!"
        }
    }

    lang_warnings = warnings.get(language, warnings["English"])
    key = "unsuitable" if not is_suitable else "suitable"
    return lang_warnings[key]
```

### `backend/routes/market.py`

```python
from flask import Blueprint, request, jsonify
import requests
import random
import os
market_bp = Blueprint("market", __name__)
DATAGOV_API  = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
DATAGOV_KEY  = os.environ.get("DATAGOV_API_KEY", "")   
AGMARKNET_INTERNAL = "https://api.agmarknet.gov.in/v1/dashboard-data/"
COMMODITY_CODES = {
    "wheat":     "Wheat",
    "rice":      "Rice",
    "paddy":     "Paddy(Deshi)",
    "maize":     "Maize",
    "onion":     "Onion",
    "potato":    "Potato",
    "tomato":    "Tomato",
    "cotton":    "Cotton",
    "soybean":   "Soyabean",
    "mustard":   "Mustard",
    "groundnut": "Groundnut",
    "sugarcane": "Sugarcane",
    "garlic":    "Garlic",
    "ginger":    "Ginger",
    "turmeric":  "Turmeric",
    "chilli":    "Dry Chillies",
    "banana":    "Banana",
    "mango":     "Mango",
}
def _normalize_crop(crop: str) -> str:
    return COMMODITY_CODES.get(crop.strip().lower(), crop.strip().title())
def _fetch_datagov(commodity: str) -> list[dict]:
    """
    Primary source: data.gov.in OGD API (official Agmarknet data).
    Requires a valid DATAGOV_API_KEY env variable.
    """
    if not DATAGOV_KEY:
        return []
    resp = requests.get(
        DATAGOV_API,
        params={
            "api-key":            DATAGOV_KEY,
            "format":             "json",
            "limit":              20,
            "filters[commodity]": commodity,
        },
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json().get("records", [])
def _fetch_agmarknet_internal(commodity: str) -> list[dict]:
    """
    Secondary source: undocumented Agmarknet 2.0 dashboard API.
    No public docs; works best with browser-like headers.
    Returns records normalised into the same shape as the OGD API.
    """
    headers = {
        "Accept":          "application/json, text/plain, */*",
        "Accept-Language": "en-IN,en;q=0.9",
        "Origin":          "https://agmarknet.gov.in",
        "Referer":         "https://agmarknet.gov.in/",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
    }
    params = {
        "commodity": commodity,
        "state":     "",
        "district":  "",
        "market":    "",
    }
    resp = requests.get(
        AGMARKNET_INTERNAL,
        params=params,
        headers=headers,
        timeout=12,
    )
    resp.raise_for_status()
    raw = resp.json()
    rows = raw if isinstance(raw, list) else raw.get("data", raw.get("records", []))
    records = []
    for r in rows:
        records.append({
            "commodity":    r.get("commodity",    commodity),
            "market":       r.get("market",       r.get("Market",      "")),
            "state":        r.get("state",        r.get("State",       "")),
            "min_price":    str(r.get("min_price",   r.get("MinPrice",   r.get("min",   "")))),
            "max_price":    str(r.get("max_price",   r.get("MaxPrice",   r.get("max",   "")))),
            "modal_price":  str(r.get("modal_price", r.get("ModalPrice", r.get("modal", "")))),
            "arrival_date": r.get("arrival_date", r.get("Date", "")),
        })
    return records
def _parse_prices(records: list[dict]) -> dict | None:
    """Compute avg min/max/modal from a list of records. Returns None if no valid prices."""
    prices = []
    for r in records:
        try:
            mn  = float(r.get("min_price",   r.get("Min Price",   0) or 0))
            mx  = float(r.get("max_price",   r.get("Max Price",   0) or 0))
            mod = float(r.get("modal_price", r.get("Modal Price", 0) or 0) or (mn + mx) / 2)
            if mn and mx:
                prices.append((mn, mx, mod))
        except (ValueError, TypeError):
            continue
    if not prices:
        return None
    return {
        "min_price": round(sum(p[0] for p in prices) / len(prices)),
        "max_price": round(sum(p[1] for p in prices) / len(prices)),
        "avg_price": round(sum(p[2] for p in prices) / len(prices)),
    }
@market_bp.get("/market")
def get_market():
    crop = request.args.get("crop")
    if not crop:
        return jsonify({"detail": "crop query parameter is required"}), 400
    commodity = _normalize_crop(crop)
    records   = []
    source    = None
    try:
        records = _fetch_datagov(commodity)
        if records:
            source = "data.gov.in (Agmarknet)"
    except Exception as exc:
    if not records:
        try:
            records = _fetch_agmarknet_internal(commodity)
            if records:
                source = "agmarknet.gov.in"
        except Exception as exc:
    if records:
        stats = _parse_prices(records)
        if stats:
            return jsonify({
                "crop":       crop,
                "commodity":  commodity,
                **stats,
                "records":    records[:5],
                "source":     source,
                "source_url": "https://agmarknet.gov.in",
            })
    base = round(1200 + random.random() * 1200)
    return jsonify({
        "crop":      crop,
        "commodity": commodity,
        "min_price": base - 200,
        "max_price": base + 200,
        "avg_price": base,
        "records":   [],
        "source":    "estimated",
        "note": (
            "Live prices unavailable. "
            "Set DATAGOV_API_KEY (register free at data.gov.in) for real data. "
            "Manual lookup: https://agmarknet.gov.in"
        ),
    })
```

### `backend/routes/weather.py`

```python
from flask import Blueprint, request, jsonify
from datetime import datetime
import requests
from config.settings import settings
weather_bp = Blueprint("weather", __name__)
@weather_bp.get("/weather")
def get_weather():
    city = request.args.get("city")
    if not city:
        return jsonify({"detail": "city query parameter is required"}), 400
    if not settings.OPENWEATHER_API_KEY:
        return jsonify({"detail": "Weather API key not configured"}), 503
    try:
        res = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": city, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"},
            timeout=10,
        )
        res.raise_for_status()
    except requests.HTTPError:
        return jsonify({"detail": "City not found. Please check the spelling."}), 404
    except Exception:
        return jsonify({"detail": "Weather service unavailable"}), 503
    data = res.json()
    return jsonify({
        "city":        data["name"],
        "country":     data["sys"]["country"],
        "temp":        round(data["main"]["temp"]),
        "feels_like":  round(data["main"]["feels_like"]),
        "temp_min":    round(data["main"]["temp_min"]),
        "temp_max":    round(data["main"]["temp_max"]),
        "humidity":    data["main"]["humidity"],
        "pressure":    data["main"]["pressure"],
        "description": data["weather"][0]["description"],
        "main":        data["weather"][0]["main"],
        "wind_speed":  data["wind"]["speed"],
        "clouds":      data["clouds"]["all"],
        "sunrise": datetime.utcfromtimestamp(data["sys"]["sunrise"]).strftime("%I:%M %p"),
        "sunset":  datetime.utcfromtimestamp(data["sys"]["sunset"]).strftime("%I:%M %p"),
    })
```

### `frontend/package.json`

```json
{
  "name": "kisaan-saathi-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "lucide-react": "^0.383.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  },
  "proxy": "http://localhost:8000"
}
```

### `frontend/postcss.config.js`

```js
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

### `frontend/public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#010828" />
    <meta name="description" content="Kisaan Saathi — AI-powered smart farming assistant for Indian farmers." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Anton&family=Condiment&display=swap" rel="stylesheet" />
    <title>Kisaan Saathi</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### `frontend/src/App.js`

```js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import History from './pages/History';
import LandingPage from './pages/LandingPage';
function PrivateRoute({ children }) {
  const farmer = localStorage.getItem('farmer');
  return farmer ? children : <Navigate to="/login" replace />;
}
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/" element={<LandingPage />} />
        {}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### `frontend/src/components/AskTab.js`

```js
import React, { useEffect, useRef, useState } from 'react'
import { session as apiSession } from '../utils/api'
import Toast from './Toast'
import { t } from '../utils/i18n'
const stepsTemplate = (language) => [
  {
    key: 'crop',
    question: '🌾 ' + t('Which crop are you growing?', language),
    options: [
      t('Wheat', language),
      t('Rice', language),
      t('Cotton', language),
      t('Tomato', language),
      t('Onion', language)
    ]
  },
  {
    key: 'problem',
    question: '🍂 ' + t('What issue are you facing?', language),
    options: [
      t('Yellow Leaves', language),
      t('Low Growth', language),
      t('Pest Problem', language),
      t('Dry Soil', language),
      t('Low Yield', language)
    ]
  },
  {
    key: 'water',
    question: '💧 ' + t('Water availability?', language),
    options: [t('Low', language), t('Moderate', language), t('High', language)]
  },
  {
    key: 'budget',
    question: '💰 ' + t('What is your budget range?', language),
    options: [t('Low', language), t('Medium', language), t('High', language)]
  },
  {
    key: 'description',
    question: '📝 ' + t('Describe your farm problem briefly', language)
  }
]
const WATER_NORMALISE = {
  'कमी': 'Low', 'मध्यम': 'Moderate', 'जास्त': 'High',
  'अधिक': 'High',
  'khup': 'High', 'jaast': 'High', 'kami': 'Low', 'madhyam': 'Moderate',
  'low': 'Low', 'moderate': 'Moderate', 'high': 'High',
  'medium': 'Moderate',
}
const BUDGET_NORMALISE = {
  'कमी': 'Low', 'मध्यम': 'Medium', 'जास्त': 'High', 'अधिक': 'High',
  'low': 'Low', 'medium': 'Medium', 'high': 'High',
  'kami': 'Low', 'madhyam': 'Medium', 'jaast': 'High',
}
const normalise = (val, map) => map[val?.trim()] || map[val?.trim()?.toLowerCase()] || val
const MARATHI_ONES = [
  'शून्य', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ',
  'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस',
  'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस',
  'तीस', 'एकतीस', 'बत्तीस', 'तेहतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस',
  'चाळीस', 'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास',
  'पन्नास', 'एक्कावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ',
  'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर',
  'सत्तर', 'एकाहत्तर', 'बहात्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी',
  'ऐंशी', 'एक्क्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद',
  'नव्वद', 'एक्क्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्याण्णव'
]
function numberToMarathi(n) {
  const num = parseInt(n, 10)
  if (isNaN(num)) return n
  if (num < 0) return 'उणे ' + numberToMarathi(Math.abs(num))
  if (num < 100) return MARATHI_ONES[num] || String(num)
  if (num < 1000) {
    const hundreds = Math.floor(num / 100)
    const rest = num % 100
    const hundredWord = hundreds === 1 ? 'शंभर' : MARATHI_ONES[hundreds] + ' शे'
    return rest === 0 ? hundredWord : hundredWord + ' ' + MARATHI_ONES[rest]
  }
  if (num < 100000) {
    const thousands = Math.floor(num / 1000)
    const rest = num % 1000
    const thousandWord = MARATHI_ONES[thousands] ? MARATHI_ONES[thousands] + ' हजार' : thousands + ' हजार'
    return rest === 0 ? thousandWord : thousandWord + ' ' + numberToMarathi(rest)
  }
  return String(num)
}
function spellNumbersInMarathi(text) {
  const devanagariMap = { '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9' }
  let normalized = text.replace(/[०-९]/g, d => devanagariMap[d] || d)
  return normalized.replace(/\d+(\.\d+)?/g, (match) => {
    if (match.includes('.')) {
      const [intPart, decPart] = match.split('.')
      return numberToMarathi(intPart) + ' दशांश ' + [...decPart].map(d => MARATHI_ONES[parseInt(d)]).join(' ')
    }
    return numberToMarathi(match)
  })
}
function AnalysisRenderer({ text }) {
  if (!text) return null
  const lines = text.split('\n').filter(l => l.trim() !== '')
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const tr = line.trim()
        if (/^#{1,3}\s/.test(tr)) {
          return (
            <p key={i} className="font-bold text-[#9be15d] text-sm mt-3 mb-1">
              {renderInline(tr.replace(/^#{1,3}\s+/, ''))}
            </p>
          )
        }
        if (/^[-*•]\s/.test(tr) && !tr.startsWith('**')) {
          return (
            <div key={i} className="flex gap-2 text-sm text-white/75">
              <span className="text-[#9be15d] mt-0.5 shrink-0">•</span>
              <span>{renderInline(tr.replace(/^[-*•]\s+/, ''))}</span>
            </div>
          )
        }
        if (/^\d+\.\s/.test(tr)) {
          const num = tr.match(/^(\d+)\./)[1]
          return (
            <div key={i} className="flex gap-2 text-sm text-white/75">
              <span className="text-[#9be15d] font-bold shrink-0 w-5">{num}.</span>
              <span>{renderInline(tr.replace(/^\d+\.\s+/, ''))}</span>
            </div>
          )
        }
        if (/^[⚠️💡✅❌🌱💧🌾🔥📌🏷]/.test(tr)) {
          return (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/80">
              {renderInline(tr)}
            </div>
          )
        }
        return (
          <p key={i} className="text-sm text-white/75 leading-relaxed">
            {renderInline(tr)}
          </p>
        )
      })}
    </div>
  )
}
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="text-white/90">{part.slice(1, -1)}</em>
    return part
  })
}
export default function AskTab({ farmerId, weatherContext }) {
  const [language, setLanguage] = useState('English')
  const steps = stepsTemplate(language)
  const [messages, setMessages] = useState([])
  const [step, setStep] = useState(0)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [location, setLocation] = useState('')
  const [result, setResult] = useState(null)
  const [cropValidation, setCropValidation] = useState(null)
  const [ttsVoices, setTtsVoices] = useState([])
  const bottomRef = useRef()
  const [formData, setFormData] = useState({
    crop: '', problem: '', water: '', budget: '', description: ''
  })
  useEffect(() => {
    const load = () => setTtsVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
  }, [])
  useEffect(() => {
    setMessages([{ type: 'bot', text: stepsTemplate(language)[0].question }])
    setStep(0)
    setFormData({ crop: '', problem: '', water: '', budget: '', description: '' })
    setResult(null)
    setCropValidation(null)
  }, [language])
  useEffect(() => {
    setLocation(t('Fetching location...', 'English'))
    if (!navigator.geolocation) {
      setLocation(t('Location unavailable', 'English'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          )
          const data = await res.json()
          const addr = data.address || {}
          const state = addr.state || ''
          const district =
            addr.state_district || addr.district || addr.city ||
            addr.town || addr.county || addr.suburb || ''
          setLocation(district && state ? `${district}, ${state}` : state || t('Location unavailable', 'English'))
        } catch {
          setLocation(t('Location unavailable', 'English'))
        }
      },
      () => setLocation(t('Location unavailable', 'English'))
    )
  }, [])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  const speakText = () => {
    if (!result?.overall_analysis) return
    let cleanText = result.overall_analysis
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
      .replace(/^\s*[-*•]\s+/gm, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim()
    if (language === 'Marathi') {
      cleanText = spellNumbersInMarathi(cleanText)
    }
    let langCode = 'en-US'
    if (language === 'Hindi') langCode = 'hi-IN'
    else if (language === 'Marathi') langCode = 'mr-IN'
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = langCode
    const voice =
      ttsVoices.find(v => v.lang === langCode && v.name.toLowerCase().includes('india')) ||
      ttsVoices.find(v => v.lang === langCode) ||
      ttsVoices.find(v => v.lang.startsWith(langCode.split('-')[0]))
    if (voice) utterance.voice = voice
    utterance.rate = 0.88
    utterance.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }
  const sendMessage = async (value) => {
    if (!value.trim()) return
    const currentStep = steps[step]
    setMessages(prev => [...prev, { type: 'user', text: value }])
    let normalisedValue = value
    if (currentStep.key === 'water') normalisedValue = normalise(value, WATER_NORMALISE)
    if (currentStep.key === 'budget') normalisedValue = normalise(value, BUDGET_NORMALISE)
    const updatedData = { ...formData, [currentStep.key]: normalisedValue }
    setFormData(updatedData)
    setInput('')
    if (step < steps.length - 1) {
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: steps[step + 1].question }])
        setStep(prev => prev + 1)
      }, 700)
    } else {
      setLoading(true)
      setTimeout(async () => {
        try {
          const res = await apiSession({
            farmer_id: farmerId,
            crop: updatedData.crop,
            farmer_problem: updatedData.problem,
            extra_description: updatedData.description,
            water_availability: updatedData.water,
            budget_range: updatedData.budget,
            location,
            soil_type: 'Loamy',
            ph: 6.5,
            nitrogen_ppm: 10,
            phosphorus_ppm: 10,
            potassium_ppm: 10,
            language,
            weather_context: weatherContext || null,
          })
          setResult(res.data.answer)
          if (res.data.crop_validation) setCropValidation(res.data.crop_validation)
          setMessages(prev => [
            ...prev,
            { type: 'bot', text: '✅ ' + t('AI recommendations generated successfully.', language) }
          ])
        } catch {
          setToast({ message: t('Failed to generate AI response.', language), type: 'error' })
        } finally {
          setLoading(false)
        }
      }, 1500)
    }
  }
  return (
    <div className="relative h-[88vh] overflow-hidden rounded-[34px] border border-white/10 bg-[#0f140d] shadow-2xl">
      {}
      <div className="border-b border-white/10 bg-[#141c11] px-6 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-condiment text-4xl text-[#9be15d]">{t('Kisaan AI', language)}</p>
            <p className="text-sm uppercase tracking-[0.2em] text-white/40">{t('Smart Farming Assistant', language)}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['English', 'Hindi', 'Marathi'].map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  language === l
                    ? 'bg-[#9be15d] text-[#18230f]'
                    : 'border border-white/10 bg-white/5 text-white/60'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      {}
      <div className="border-b border-white/5 bg-[#11180d] px-6 py-3">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        />
      </div>
      {}
      <div className="h-[55vh] overflow-y-auto px-5 py-6 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-xl ${
              msg.type === 'user'
                ? 'bg-[#9be15d] text-[#18230f]'
                : 'border border-white/10 bg-[#18210f] text-white'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-3xl border border-white/10 bg-[#18210f] px-5 py-4 text-sm text-white shadow-xl">
              {t('Analyzing soil...', language)}<br />
              {t('Checking farming conditions...', language)}<br />
              {t('Generating AI recommendations...', language)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {}
      {!loading && step < steps.length && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {steps[step].options?.map((option) => (
            <button
              key={option}
              onClick={() => sendMessage(option)}
              className="rounded-full border border-[#9be15d]/20 bg-[#9be15d]/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#dfffc2] transition-all hover:bg-[#9be15d]/20"
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {}
      {!loading && step < steps.length && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#141c11] p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Type your answer...', language)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/30"
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input) }}
            />
            <button
              onClick={() => sendMessage(input)}
              className="rounded-2xl bg-[#9be15d] px-6 py-4 font-black uppercase tracking-wider text-[#18230f] transition-all hover:scale-105"
            >
              {t('Send', language)}
            </button>
          </div>
        </div>
      )}
      {}
      {result && (
        <div className="absolute inset-0 z-30 overflow-y-auto bg-[#0f140d] p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-condiment text-5xl text-[#9be15d]">{t('AI Recommendation', language)}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.2em] text-white/40">{t('Smart Farming Analysis', language)}</p>
              </div>
              <button
                onClick={speakText}
                className="rounded-2xl border border-[#9be15d]/20 bg-[#9be15d]/10 px-5 py-3 text-sm font-bold uppercase tracking-wide text-[#dfffc2]"
              >
                {t('Listen', language)}
              </button>
            </div>
            {}
            {cropValidation && !cropValidation.is_suitable && (
              <div className="rounded-[28px] border-2 border-red-500/50 bg-red-500/10 p-6 shadow-2xl">
                <h3 className="mb-3 flex items-center gap-2 text-xl font-black uppercase tracking-wide text-red-400">
                  ⚠️ {t('Crop Suitability Alert', language)}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-white/75">{cropValidation.warning}</p>
                <div className="rounded-lg border border-red-400/30 bg-red-500/5 p-4">
                  <p className="mb-3 text-sm font-bold text-white/80">{t('Region Information', language)}</p>
                  <ul className="space-y-2 text-xs text-white/60">
                    <li><strong className="text-white/80">{t('Climate Zone', language)}:</strong> {cropValidation.climate}</li>
                    <li><strong className="text-white/80">{t('Annual Rainfall', language)}:</strong> {cropValidation.rainfall}</li>
                    <li><strong className="text-white/80">{t('Soil Type', language)}:</strong> {cropValidation.soil}</li>
                  </ul>
                </div>
              </div>
            )}
            {}
            {cropValidation && cropValidation.is_suitable && (
              <div className="rounded-[28px] border-2 border-[#9be15d]/50 bg-[#9be15d]/10 p-6 shadow-2xl">
                <h3 className="mb-3 flex items-center gap-2 text-xl font-black uppercase tracking-wide text-[#9be15d]">
                  ✅ {t('Crop is Well-Suited', language)}
                </h3>
                <p className="text-sm text-white/75">{cropValidation.warning}</p>
              </div>
            )}
            {}
            {cropValidation && !cropValidation.is_suitable && cropValidation.suitable_crops?.length > 0 && (
              <div className="rounded-[28px] border border-yellow-500/30 bg-yellow-500/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black uppercase tracking-wide text-yellow-400">
                  💡 {t('Better Crop Options for', language)} {cropValidation.region}
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {cropValidation.suitable_crops.map((crop, idx) => (
                    <div key={idx} className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4">
                      <p className="font-bold text-yellow-300">🌾 {crop}</p>
                      <p className="mt-1 text-xs text-white/60">{t('Recommended for this region', language)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-3 text-xs text-white/70">
                  <strong>{t('Tip', language)}:</strong> {t('These crops are naturally suited to', language)} {cropValidation.region}'s {t('climate and soil. Growing them will likely give you better yields with less effort.', language)}
                </p>
              </div>
            )}
            {/* Water compatibility warning */}
            {cropValidation && !cropValidation.water_compatible && (
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4">
                <p className="flex items-start gap-2 text-sm text-white/70">
                  <span className="text-lg">⚠️</span>
                  <span>{cropValidation.water_message}</span>
                </p>
              </div>
            )}
            {/* Overall analysis */}
            <div className="rounded-[28px] border border-[#9be15d]/20 bg-[#17210f] p-6 shadow-2xl">
              <h3 className="mb-4 text-2xl font-black uppercase tracking-wide text-[#9be15d]">
                {t('Overall Analysis', language)}
              </h3>
              <AnalysisRenderer text={result.overall_analysis} />
            </div>
            {/* Fertilizers */}
            {result.fertilizers?.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-black uppercase tracking-wide text-[#9be15d]">
                  🌾 {t('Fertilizers', language)}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.fertilizers.map((f, i) => (
                    <div key={i} className="rounded-[24px] border border-white/10 bg-[#141c11] p-5 shadow-xl">
                      <p className="text-xl font-black uppercase text-[#9be15d]">{f.name}</p>
                      <p className="mt-2 text-sm text-white/60">{t('Quantity', language)}: {f.quantity_per_acre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Soil tips */}
            {result.soil_analysis_and_tips?.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-black uppercase tracking-wide text-[#9be15d]">
                  🌱 {t('Recommendations', language)}
                </h3>
                <div className="space-y-3">
                  {result.soil_analysis_and_tips.map((tip, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-[#141c11] p-4 shadow-xl">
                      <AnalysisRenderer text={tip} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
```

### `frontend/src/components/FeaturesSection.js`

```js
import { useNavigate } from "react-router-dom"

export default function FeaturesSection() {
 const navigate = useNavigate()
  const features = [
    {
      icon: '🌦️',
      title: 'Smart Weather Monitoring',
      description:
        'Get real-time weather updates with farming-focused recommendations and alerts.',
    },
    {
      icon: '🤖',
      title: 'AI Farming Assistant',
      description:
        'Ask farming questions and receive AI-powered guidance instantly.',
    },
    {
      icon: '💰',
      title: 'Market Price Tracking',
      description:
        'Track live crop market prices and make smarter selling decisions.',
    },
  ]

  return (
    <section className="bg-[#f5f1e8] px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        {}
        <div className="text-center">
          <p className="font-bold uppercase tracking-[0.3em] text-[#4caf50]">
            Smart Agriculture
          </p>

          <h2 className="mt-4 text-4xl font-black text-[#2f3e2c] md:text-5xl">
            Everything Farmers Need
            <span className="block text-[#4caf50]">In One Platform</span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[#5f6f52]">
            Kisaan Saathi combines artificial intelligence, weather analytics,
            crop recommendations, and farming insights into one modern
            agriculture platform.
          </p>
        </div>

        {}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl border border-[#d8e3cf] bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5e9] text-3xl transition group-hover:scale-110">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-2xl font-black text-[#2f3e2c]">
                {feature.title}
              </h3>

              <p className="mt-4 leading-relaxed text-[#5f6f52]">
                {feature.description}
              </p>

              <button className="mt-6 font-bold text-[#4caf50] transition hover:translate-x-2"  onClick={() => navigate("/signup")}>
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### `frontend/src/components/MarketTab.js`

```js
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
      {}
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
      {}
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
      {}
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
```

### `frontend/src/components/Navbar.js`

```js
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
      {}
      <div className="flex items-end gap-1.5">
        <span className="font-grotesk text-cream text-sm uppercase tracking-wider md:text-base">Kisaan</span>
        <span className="font-condiment text-neon text-lg md:text-xl ml-0.5">Saathi</span>
      </div>
      {}
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
```

### `frontend/src/components/TipsTab.js`

```js
import React from 'react';
const TIPS = [
  {
    title: '🌱 Seasonal Farming Tips',
    color: 'result-box-green',
    titleColor: 'text-neon',
    items: [
      { head: 'Kharif Season (June–Oct):', points: ['Best for rice, cotton, maize', 'Ensure good drainage', 'Monitor for monsoon pests'] },
      { head: 'Rabi Season (Nov–Mar):', points: ['Ideal for wheat, mustard', 'Manage irrigation carefully', 'Protect from frost damage'] },
    ],
  },
  {
    title: '🌍 Soil Health Management',
    color: 'result-box-blue',
    titleColor: 'text-blue-400',
    items: [{ points: ['Test soil pH every 2–3 years', 'Add organic manure regularly', 'Practice crop rotation', 'Avoid over-fertilization', 'Use cover crops in off-season', 'Maintain proper drainage'] }],
  },
  {
    title: '💧 Water Management',
    color: 'result-box-orange',
    titleColor: 'text-orange-400',
    items: [{ points: ['Drip irrigation saves 40% water', 'Water early morning or evening', 'Mulching reduces evaporation', 'Check soil moisture before irrigation', 'Harvest rainwater when possible'] }],
  },
  {
    title: '🏛️ Government Schemes',
    color: 'result-box-green',
    titleColor: 'text-neon',
    items: [{ points: ['PM-KISAN: ₹6000/year direct benefit', 'Soil Health Card Scheme', 'Pradhan Mantri Fasal Bima Yojana', 'KCC: Kisan Credit Card', 'e-NAM: National Agriculture Market'] }],
  },
  {
    title: '📞 Important Contacts',
    color: 'result-box-blue',
    titleColor: 'text-blue-400',
    items: [{ points: ['Kisan Call Centre: 1800-180-1551', 'Agricultural Officer: Contact local office', 'Soil Testing Lab: Check district centre', 'Mandi Bhav: 1800-270-0224', 'e-NAM Helpline: 1800-270-0224'] }],
  },
];
export default function TipsTab() {
  return (
    <div className="space-y-4">
      {TIPS.map((section) => (
        <div key={section.title} className={`result-box ${section.color}`}>
          <p className={`result-title ${section.titleColor}`}>{section.title}</p>
          {section.items.map((block, bi) => (
            <div key={bi} className="mb-3 last:mb-0">
              {block.head && (
                <p className="font-grotesk text-[12px] text-cream/70 uppercase tracking-wide mb-2">{block.head}</p>
              )}
              {block.points.map((pt, pi) => (
                <p key={pi} className="font-mono text-[13px] text-cream/65 mb-1">• {pt}</p>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### `frontend/src/components/Toast.js`

```js
import React, { useEffect } from 'react';
export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);
  return (
    <div className={`ks-toast${type === 'error' ? ' error' : ''}`}>
      {message}
    </div>
  );
}
```

### `frontend/src/components/WeatherTab.js`

```js
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
      {}
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
        {}
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_CITIES.map((c) => (
            <button key={c} onClick={() => { setCity(c); handleSearch(c); }}
              className="liquid-glass px-3 py-1.5 rounded-full font-mono text-[11px] text-cream/60 hover:text-neon uppercase tracking-widest transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>
      {}
      {data && (
        <div className="animate-fade-up space-y-4">
          <div className="weather-hero">
            <p className="font-grotesk text-2xl text-cream uppercase">{data.city}, {data.country}</p>
            <p className="font-grotesk text-6xl text-cream mt-2">{data.temp}°C</p>
            <p className="font-mono text-[14px] text-cream/60 mt-1 uppercase tracking-widest">{data.description}</p>
            <p className="font-mono text-[12px] text-cream/40 mt-1">Feels like {data.feels_like}°C</p>
          </div>
          {}
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
          {}
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
      {}
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
```

### `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background-color: #010828;
  color: #EFF4FF;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.fancy-input {
  width: 100%;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  padding: 16px 18px;
  color: white;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
}
.fancy-input:focus {
  border-color: rgba(155,225,93,0.5);
  box-shadow: 0 0 0 4px rgba(155,225,93,0.08);
}
.fancy-input option {
  background: #18230f;
  color: white;
}
.liquid-glass {
  background: rgba(255,255,255,0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.45) 0%,
    rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%,
    rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%,
    rgba(255,255,255,0.45) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #010828; }
::-webkit-scrollbar-thumb { background: rgba(111,255,0,0.3); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(111,255,0,0.6); }
@keyframes fadeUp {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes pulse-neon {
  0%,100% { box-shadow: 0 0 8px rgba(111,255,0,0.4); }
  50%     { box-shadow: 0 0 24px rgba(111,255,0,0.9); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.animate-fade-up  { animation: fadeUp 0.6s ease forwards; }
.neon-pulse       { animation: pulse-neon 2s ease-in-out infinite; }
.spin-slow        { animation: spin-slow 3s linear infinite; }
.ks-input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 14px 18px;
  font-family: ui-monospace, monospace;
  font-size: 13px;
  color: #EFF4FF;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  outline: none;
  transition: border-color 0.2s;
}
.ks-input::placeholder { color: rgba(239,244,255,0.25); }
.ks-input:focus { border-color: rgba(111,255,0,0.5); }
.ks-btn {
  width: 100%;
  background: #6FFF00;
  color: #010828;
  font-family: Anton, sans-serif;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.ks-btn:hover   { opacity: 0.88; }
.ks-btn:disabled{ opacity: 0.35; cursor: not-allowed; }
.ks-btn-ghost {
  width: 100%;
  background: transparent;
  color: #EFF4FF;
  font-family: Anton, sans-serif;
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.ks-btn-ghost:hover { background: rgba(255,255,255,0.06); border-color: rgba(111,255,0,0.3); }
.ks-card {
  border-radius: 24px;
  padding: 24px;
}
.ks-badge {
  display: inline-block;
  font-family: Anton, sans-serif;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 999px;
}
.ks-tab {
  flex: 1;
  padding: 14px 6px;
  text-align: center;
  font-family: Anton, sans-serif;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(239,244,255,0.45);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
}
.ks-tab:hover  { color: #EFF4FF; }
.ks-tab.active { color: #6FFF00; border-bottom-color: #6FFF00; }
.ks-select {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 14px 18px;
  font-family: ui-monospace, monospace;
  font-size: 13px;
  color: #EFF4FF;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236FFF00' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
}
.ks-select option { background: #010828; color: #EFF4FF; }
.ks-select:focus { border-color: rgba(111,255,0,0.5); }
.ks-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  padding: 12px 24px;
  border-radius: 14px;
  font-family: Anton, sans-serif;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: #010828;
  background: #6FFF00;
  box-shadow: 0 4px 24px rgba(111,255,0,0.35);
  animation: fadeUp 0.35s ease;
}
.ks-toast.error {
  background: #ff4d4d;
  color: #fff;
  box-shadow: 0 4px 24px rgba(255,77,77,0.35);
}
.result-box {
  border-radius: 20px;
  padding: 20px 24px;
  margin-top: 16px;
}
.result-box-green  { border-left: 4px solid #6FFF00; background: rgba(111,255,0,0.05); }
.result-box-orange { border-left: 4px solid #ff9800; background: rgba(255,152,0,0.05); }
.result-box-blue   { border-left: 4px solid #2196f3; background: rgba(33,150,243,0.05); }
.result-title {
  font-family: Anton, sans-serif;
  font-size: 15px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.weather-hero {
  border-radius: 20px;
  background: rgba(33,150,243,0.08);
  border: 1px solid rgba(33,150,243,0.2);
  padding: 32px;
  text-align: center;
  margin-top: 16px;
}
.market-card {
  border-radius: 20px;
  background: rgba(111,255,0,0.04);
  border: 1px solid rgba(111,255,0,0.12);
  padding: 20px 24px;
  margin-top: 16px;
}
```

### `frontend/src/index.js`

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### `frontend/src/pages/History.js`

```js
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
      {}
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
              const displayQuestion = item.user_summary
                ? item.user_summary
                : isRawPrompt(item.question)
                  ? null   
                  : item.question;
              const isSession = displayQuestion && displayQuestion.includes(' | ') && displayQuestion.includes('Crop:');
              return (
                <div key={idx} className="liquid-glass rounded-[20px] p-5 border-l-2 border-neon/30">
                  {}
                  <div className="flex items-center justify-between mb-3">
                    <span className="ks-badge bg-neon/10 text-neon">
                      {item.language || 'English'}
                    </span>
                    <span className="font-mono text-[11px] text-cream/30">
                      {item.created_at ? new Date(item.created_at).toLocaleString('en-IN') : ''}
                    </span>
                  </div>
                  {}
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
```

### `frontend/src/pages/Home.js`

```js
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
      {}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-60"
          style={{ background: 'radial-gradient(ellipse, rgba(111,255,0,0.04) 0%, transparent 70%)' }}
        />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-20 md:pt-24 md:pb-10">
        {}
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
          {}
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
        {}
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
        {}
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
```

### `frontend/src/pages/LandingPage.js`

```js
import FeaturesSection from "../components/FeaturesSection"
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f5f1e8] text-[#2f3e2c]">

      {}
      <section className="relative min-h-screen w-full overflow-hidden">

        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/farm.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        {}
        <nav className="relative z-20 flex items-center justify-between px-5 py-5 md:px-12 md:py-6">
          <div onClick={() => navigate("/")} className="flex items-end gap-2 cursor-pointer">
            <p className="font-condiment text-[#9be15d] text-4xl md:text-5xl leading-none">Kisaan</p>
            <h1 className="font-['Anton'] uppercase tracking-[0.2em] text-white text-xl md:text-2xl leading-none mb-1">SAATHI</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate("/login")}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="rounded-full bg-[#9be15d] px-4 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-black text-[#16210f] transition hover:brightness-110 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </nav>

        {}
        <div className="relative z-10 flex min-h-[82vh] flex-col items-center justify-center px-5 text-center pb-12">
          <div className="max-w-4xl">

            <span className="mb-6 inline-block rounded-full border border-[#9be15d]/40 bg-[#9be15d]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#dfffc2] backdrop-blur-sm md:px-6 md:py-3 md:text-sm">
              AI Powered Smart Farming
            </span>

            <h1 className="mt-4 text-4xl font-black leading-[0.95] text-white md:text-6xl lg:text-7xl">
              Empowering Farmers
              <span className="block mt-1">With</span>
              <span className="block text-[#9be15d] mt-1">AI Intelligence</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-xl">
              Real-time weather insights, smart fertilizer recommendations,
              crop guidance, and market prices — all in one platform.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto rounded-2xl bg-[#9be15d] px-8 py-4 text-base font-black text-[#16210f] shadow-lg transition hover:brightness-110 active:scale-95 md:px-10 md:py-5 md:text-lg"
              >
                🌾 Start Analysis
              </button>
              <button
                onClick={() => navigate("/home")}
                className="w-full sm:w-auto rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95 md:px-10 md:py-5 md:text-lg"
              >
                🤖 Talk To Farm AI
              </button>
            </div>

          </div>
        </div>

      </section>

      <FeaturesSection />

    </div>
  )
}
```

### `frontend/src/pages/Login.js`

```js
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
      {}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(111,255,0,0.05) 0%, transparent 70%)' }} />
      </div>
      <div className="w-full max-w-sm relative z-10">
        {}
        <div className="text-center mb-8">
          <p className="font-condiment text-neon text-5xl mb-0.5">Kisaan</p>
          <h1 className="font-grotesk text-3xl text-cream uppercase tracking-wider">Saathi</h1>
          <p className="font-mono text-[11px] text-cream/35 uppercase tracking-widest mt-2">
            AI-powered smart farming assistant
          </p>
          <p className="font-mono text-[10px] text-cream/20 mt-1">किसान एआई सहायक</p>
        </div>
        {}
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
```

### `frontend/src/pages/Signup.js`

```js
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
```

### `frontend/src/utils/api.js`

```js
import axios from 'axios';
const API_BASE = 'http://127.0.0.1:8000';
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
```

### `frontend/src/utils/i18n.js`

```js
export const translations = {
  English: {
    "Kisaan AI": "Kisaan AI",
    "Smart Farming Assistant": "Smart Farming Assistant",
    "AI Recommendation": "AI Recommendation",
    "Smart Farming Analysis": "Smart Farming Analysis",

    "English": "English",
    "Hindi": "Hindi",
    "Marathi": "Marathi",

    "Which crop are you growing?": "Which crop are you growing?",
    "What issue are you facing?": "What issue are you facing?",
    "Water availability?": "Water availability?",
    "What is your budget range?": "What is your budget range?",
    "Describe your farm problem briefly": "Describe your farm problem briefly",

    "Wheat": "Wheat",
    "Rice": "Rice",
    "Cotton": "Cotton",
    "Tomato": "Tomato",
    "Onion": "Onion",
    "Yellow Leaves": "Yellow Leaves",
    "Low Growth": "Low Growth",
    "Pest Problem": "Pest Problem",
    "Dry Soil": "Dry Soil",
    "Low Yield": "Low Yield",
    "Low": "Low",
    "Moderate": "Moderate",
    "High": "High",
    "Medium": "Medium",

    "Type your answer...": "Type your answer...",
    "Send": "Send",
    "Listen": "🔊 Listen",
    "Fetching location...": "Fetching location...",
    "Location unavailable": "Location unavailable",

    "Analyzing soil...": "🌱 Analyzing soil...",
    "Checking farming conditions...": "🌦️ Checking farming conditions...",
    "Generating AI recommendations...": "🤖 Generating AI recommendations...",
    "AI recommendations generated successfully.": "✅ AI recommendations generated successfully.",

    "Crop Suitability Alert": "⚠️ Crop Suitability Alert",
    "Crop is Well-Suited": "✅ Crop is Well-Suited",
    "Region Information": "📍 Region Information:",
    "Climate Zone": "Climate Zone",
    "Annual Rainfall": "Annual Rainfall",
    "Soil Type": "Soil Type",
    "Better Crop Options for": "💡 Better Crop Options for",
    "Recommended for this region": "Recommended for this region",
    "Tip": "📚 Tip",
    "These crops are naturally suited to": "These crops are naturally suited to",
    "climate and soil. Growing them will likely give you better yields with less effort.": "climate and soil. Growing them will likely give you better yields with less effort.",

    "Overall Analysis": "Overall Analysis",
    "Quantity": "Quantity",
    "Fertilizers": "Fertilizers",
    "Recommendations": "Recommendations",

    "Home": "Home",
    "History": "History",
    "Ask": "Ask",
    "Weather": "Weather",
    "Market": "Market",
    "Tips": "Tips",
    "Login": "Login",
    "Signup": "Signup",
    "Logout": "Logout",

    "Failed to generate AI response.": "Failed to generate AI response.",
    "Success": "Success",
    "Error": "Error",
  },

  Hindi: {
    "Kisaan AI": "किसान एआई",
    "Smart Farming Assistant": "स्मार्ट कृषि सहायक",
    "AI Recommendation": "एआई सिफारिश",
    "Smart Farming Analysis": "स्मार्ट कृषि विश्लेषण",

    "English": "English",
    "Hindi": "हिंदी",
    "Marathi": "Marathi",

    "Which crop are you growing?": "🌾 आप कौन सी फसल उगा रहे हैं?",
    "What issue are you facing?": "🍂 आप किस समस्या का सामना कर रहे हैं?",
    "Water availability?": "💧 पानी की उपलब्धता कैसी है?",
    "What is your budget range?": "💰 आपका बजट कितना है?",
    "Describe your farm problem briefly": "📝 अपनी कृषि समस्या का संक्षेप में वर्णन करें",

    "Wheat": "गेहूं",
    "Rice": "चावल",
    "Cotton": "कपास",
    "Tomato": "टमाटर",
    "Onion": "प्याज",
    "Yellow Leaves": "पीली पत्तियां",
    "Low Growth": "कम वृद्धि",
    "Pest Problem": "कीट समस्या",
    "Dry Soil": "सूखी मिट्टी",
    "Low Yield": "कम पैदावार",
    "Low": "कम",
    "Moderate": "मध्यम",
    "High": "अधिक",
    "Medium": "मध्यम",

    "Type your answer...": "अपना उत्तर लिखें...",
    "Send": "भेजें",
    "Listen": "🔊 सुनें",
    "Fetching location...": "स्थान प्राप्त किया जा रहा है...",
    "Location unavailable": "स्थान उपलब्ध नहीं है",

    "Analyzing soil...": "🌱 मिट्टी का विश्लेषण किया जा रहा है...",
    "Checking farming conditions...": "🌦️ कृषि परिस्थितियों की जांच हो रही है...",
    "Generating AI recommendations...": "🤖 एआई सिफारिशें तैयार की जा रही हैं...",
    "AI recommendations generated successfully.": "✅ एआई सिफारिशें सफलतापूर्वक तैयार हो गईं।",

    "Crop Suitability Alert": "⚠️ फसल उपयुक्तता चेतावनी",
    "Crop is Well-Suited": "✅ यह फसल उपयुक्त है",
    "Region Information": "📍 क्षेत्र की जानकारी:",
    "Climate Zone": "जलवायु क्षेत्र",
    "Annual Rainfall": "वार्षिक वर्षा",
    "Soil Type": "मिट्टी का प्रकार",
    "Better Crop Options for": "💡 इसके लिए बेहतर फसल विकल्प",
    "Recommended for this region": "इस क्षेत्र के लिए अनुशंसित",
    "Tip": "📚 सुझाव",
    "These crops are naturally suited to": "ये फसलें स्वाभाविक रूप से उपयुक्त हैं",
    "climate and soil. Growing them will likely give you better yields with less effort.": "जलवायु और मिट्टी के लिए। इन्हें उगाने से कम मेहनत में बेहतर उत्पादन मिलेगा।",

    "Overall Analysis": "समग्र विश्लेषण",
    "Quantity": "मात्रा",
    "Fertilizers": "उर्वरक",
    "Recommendations": "सिफारिशें",

    "Home": "होम",
    "History": "इतिहास",
    "Ask": "पूछें",
    "Weather": "मौसम",
    "Market": "बाजार",
    "Tips": "सुझाव",
    "Login": "लॉगिन",
    "Signup": "साइन अप",
    "Logout": "लॉगआउट",

    "Failed to generate AI response.": "एआई प्रतिक्रिया उत्पन्न करने में विफल।",
    "Success": "सफलता",
    "Error": "त्रुटि",
  },

  Marathi: {
    "Kisaan AI": "किसान एआय",
    "Smart Farming Assistant": "स्मार्ट शेती सहाय्यक",
    "AI Recommendation": "एआय शिफारस",
    "Smart Farming Analysis": "स्मार्ट शेती विश्लेषण",

    "English": "English",
    "Hindi": "Hindi",
    "Marathi": "मराठी",

    "Which crop are you growing?": "🌾 आपण कोणते पीक घेत आहात?",
    "What issue are you facing?": "🍂 आपण कोणत्या समस्येला सामोरे जात आहात?",
    "Water availability?": "💧 पाण्याची उपलब्धता कशी आहे?",
    "What is your budget range?": "💰 तुमचा बजेट किती आहे?",
    "Describe your farm problem briefly": "📝 तुमच्या शेती समस्येचे थोडक्यात वर्णन करा",

    "Wheat": "गहू",
    "Rice": "तांदूळ",
    "Cotton": "कापूस",
    "Tomato": "टोमॅटो",
    "Onion": "कांदा",
    "Yellow Leaves": "पिवळी पाने",
    "Low Growth": "कमी वाढ",
    "Pest Problem": "कीड समस्या",
    "Dry Soil": "कोरडी माती",
    "Low Yield": "कमी उत्पादन",
    "Low": "कमी",
    "Moderate": "मध्यम",
    "High": "जास्त",
    "Medium": "मध्यम",

    "Type your answer...": "तुमचे उत्तर लिहा...",
    "Send": "पाठवा",
    "Listen": "🔊 ऐका",
    "Fetching location...": "स्थान मिळवत आहे...",
    "Location unavailable": "स्थान उपलब्ध नाही",

    "Analyzing soil...": "🌱 मातीचे विश्लेषण करत आहे...",
    "Checking farming conditions...": "🌦️ शेतीची परिस्थिती तपासत आहे...",
    "Generating AI recommendations...": "🤖 एआय शिफारसी तयार करत आहे...",
    "AI recommendations generated successfully.": "✅ एआय शिफारसी यशस्वीरित्या तयार झाल्या.",

    "Crop Suitability Alert": "⚠️ पीक योग्यतेची सूचना",
    "Crop is Well-Suited": "✅ हे पीक योग्य आहे",
    "Region Information": "📍 प्रदेश माहिती:",
    "Climate Zone": "हवामान क्षेत्र",
    "Annual Rainfall": "वार्षिक पाऊस",
    "Soil Type": "मातीचा प्रकार",
    "Better Crop Options for": "💡 यासाठी चांगले पीक पर्याय",
    "Recommended for this region": "या प्रदेशासाठी शिफारस केलेले",
    "Tip": "📚 सूचना",
    "These crops are naturally suited to": "ही पिके नैसर्गिकरित्या उपयुक्त आहेत",
    "climate and soil. Growing them will likely give you better yields with less effort.": "हवामान आणि मातीसाठी. ती घेतल्यास कमी मेहनतीत जास्त उत्पादन मिळेल.",

    "Overall Analysis": "संपूर्ण विश्लेषण",
    "Quantity": "प्रमाण",
    "Fertilizers": "खते",
    "Recommendations": "शिफारसी",

    "Home": "होम",
    "History": "इतिहास",
    "Ask": "विचारा",
    "Weather": "हवामान",
    "Market": "बाजार",
    "Tips": "सल्ले",
    "Login": "लॉगिन",
    "Signup": "साइन अप",
    "Logout": "लॉग आउट",

    "Failed to generate AI response.": "एआय प्रतिसाद तयार करण्यात अयशस्वी.",
    "Success": "यशस्वी",
    "Error": "त्रुटी",
  },
};

export const t = (key, language = "English") => {
  return translations[language]?.[key] || translations.English[key] || key;
};
```

### `frontend/tailwind.config.js`

```js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        grotesk:   ["Anton", "sans-serif"],
        condiment: ["Condiment", "cursive"],
        mono:      ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        background: "#010828",
        cream:      "#EFF4FF",
        neon:       "#6FFF00",
      },
    },
  },
  plugins: [],
};
```

### `test_gemini.py`

```python
import google.generativeai as genai

genai.configure(api_key="AIzaSyBtX9SYp2eG0TLj1m_e2n9HgVNGRWDPDKY")

model = genai.GenerativeModel("gemini-2.5-flash-lite")

response = model.generate_content("Say hello")
```

---

*End of context. You now have full visibility into this project.*
