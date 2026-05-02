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


def get_regional_soil_hint(location: str) -> str:
    """Suggest typical soil types for Indian regions"""
    location_lower = location.lower().strip() if location else ""
    
    # Major Indian regions and their typical soil types
    soil_hints = {
        # Northern India
        "punjab": "Alluvial soil (fertile, good for wheat/rice)",
        "haryana": "Alluvial soil (fertile, good drainage)",
        "delhi": "Alluvial soil (mixed with urban influence)",
        "uttar pradesh": "Alluvial soil in plains, black soil in south",
        "uttarakhand": "Mountain soil, alluvial in valleys",
        "himachal": "Mountain soil, brown forest soil",
        
        # Western India
        "rajasthan": "Arid desert soil, alluvial in river valleys",
        "gujarat": "Black cotton soil, alluvial in coastal areas",
        "maharashtra": "Black cotton soil, laterite in western ghats",
        "goa": "Laterite soil, coastal sandy soil",
        
        # Southern India
        "karnataka": "Red soil, black soil in north, laterite in west",
        "tamil nadu": "Black soil in north, red soil in south",
        "kerala": "Laterite soil, alluvial in river deltas",
        "andhra pradesh": "Red soil, black soil in north",
        "telangana": "Red soil, black soil in north",
        
        # Eastern India
        "west bengal": "Alluvial soil, laterite in west",
        "bihar": "Alluvial soil, fertile river plains",
        "jharkhand": "Red soil, laterite in plateau areas",
        "odisha": "Red soil, alluvial in coastal areas",
        
        # North-Eastern India
        "assam": "Alluvial soil, acidic in hills",
        "meghalaya": "Red soil, acidic forest soil",
        "tripura": "Red soil, alluvial in plains",
        
        # Central India
        "madhya pradesh": "Black soil, red soil in east",
        "chhattisgarh": "Red soil, laterite in some areas",
        
        # Union Territories
        "jammu": "Alluvial soil, mountain soil",
        "kashmir": "Alluvial soil in valleys, mountain soil",
        "chandigarh": "Alluvial soil",
        "puducherry": "Red soil, laterite",
    }
    
    # Check for matches in location
    for region, soil_info in soil_hints.items():
        if region in location_lower:
            return f"Typical soil in {region.title()}: {soil_info}"
    
    # Default hints for major regions
    if any(word in location_lower for word in ["north", "uttar", "punjab", "haryana", "delhi"]):
        return "Northern India typically has alluvial soil (fertile, good for most crops)"
    elif any(word in location_lower for word in ["south", "karnataka", "tamil", "kerala", "andhra"]):
        return "Southern India typically has red soil or black cotton soil"
    elif any(word in location_lower for word in ["west", "rajasthan", "gujarat", "maharashtra"]):
        return "Western India typically has black cotton soil or arid desert soil"
    elif any(word in location_lower for word in ["east", "bengal", "bihar", "odisha"]):
        return "Eastern India typically has alluvial soil or red soil"
    
    return "Common Indian soil types: alluvial (fertile river plains), black (cotton areas), red (deccan plateau), laterite (coastal/hilly), desert (arid regions)"


def clean_json_response(raw: str):
    if not raw:
        return None
    raw = raw.replace("```json", "").replace("```", "").strip()
    raw = re.sub(r"[\x00-\x1F\x7F]", "", raw)
    try:
        return json.loads(raw)
    except Exception:
        # Try to extract the first JSON object from the model output.
        match = re.search(r"(\{.*\})", raw, re.S)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
        return None


def call_gemini(prompt: str) -> str:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    if hasattr(genai, "GenerativeModel"):
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        response = model.generate_content(prompt)
    elif hasattr(genai, "generate_text"):
        response = genai.generate_text(model="gemini-2.5-flash-lite", prompt=prompt)
    else:
        raise RuntimeError("Unsupported google-generativeai client version")

    if hasattr(response, "text"):
        return response.text.strip()
    if hasattr(response, "output"):
        try:
            return json.dumps(response.output)
        except Exception:
            return str(response.output).strip()
    return str(response).strip()


# ---------------------------------------------------------------------------
# /ask  — general farming question, freeform
# ---------------------------------------------------------------------------

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
{{
  "invalid": false,
  "error_message": "",
  "overall_analysis": "Detailed, practical answer in simple language. Step-by-step where needed.",
  "fertilizers": [
    {{
      "name": "actual fertilizer name relevant to this query",
      "quantity_per_acre": "specific quantity",
      "when_to_apply": "specific timing",
      "why": "one simple sentence explaining why this helps"
    }}
  ],
  "tips": [
    "Specific, actionable tip relevant to THIS question",
    "COMMON MISTAKE farmers make in this exact situation",
    "One easy trick or cost-saving idea"
  ],
  "when_to_call_expert": "Tell farmer when to stop DIY and call a Krishi Sevak or agriculture officer"
}}
"""


# ---------------------------------------------------------------------------
# /session  — full farm session with crop + soil + location
# ---------------------------------------------------------------------------

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
Current weather        : {weather_context}
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
- Include weather-based tips based on the current weather conditions provided.
- Provide at least 5-6 specific, actionable tips covering different aspects.
- Make the overall_analysis comprehensive with detailed steps for the entire farming cycle.

Respond ONLY with this JSON (no markdown, no extra text):
{{
  "invalid": false,
  "error_message": "",
  "crop_suitability": {{
    "is_suitable": true,
    "verdict": "One clear sentence: is this crop a good, risky, or bad choice here?",
    "reason": "Why — based on region climate, soil, rainfall. Use your knowledge.",
    "suggested_alternatives": []
  }},
  "overall_analysis": "COMPREHENSIVE farming plan in simple language, step by step, for THIS farmer. Include preparation, planting, maintenance, and harvesting phases. Make it detailed and practical.",
  "fertilizers": [
    {{
      "name": "specific fertilizer name",
      "quantity_per_acre": "specific amount",
      "when_to_apply": "specific stage or month",
      "why": "one sentence — why this is needed given the soil data above"
    }}
  ],
  "tips": [
    "Specific tip for THIS crop + location + problem",
    "Weather-based tip considering current conditions",
    "COMMON MISTAKE for this crop in this region",
    "Water/budget tip matching their constraints",
    "Soil management tip based on pH and NPK values",
    "Pest/disease prevention tip for this crop"
  ],
  "timeline": {{
    "land_prep": "when and what to do",
    "sowing": "best sowing window for this crop in this region",
    "key_stages": "brief milestones",
    "harvest": "expected harvest window"
  }},
  "when_to_call_expert": "Specific signs that mean this farmer should call a Krishi Sevak"
}}
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
        print("🔥 GEMINI ERROR:", str(e))
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
    soil_type         = payload.get("soil_type", "Not specified").strip()
    ph                = payload.get("ph", "Not specified").strip()
    nitrogen_ppm      = payload.get("nitrogen_ppm", "Not specified").strip()
    phosphorus_ppm    = payload.get("phosphorus_ppm", "Not specified").strip()
    potassium_ppm     = payload.get("potassium_ppm", "Not specified").strip()
    water_availability = payload.get("water_availability", "Moderate").strip()
    budget_range      = payload.get("budget_range", "Medium").strip()
    weather_context   = payload.get("weather_context", "Not available").strip()
    language          = payload.get("language", "English")
    lang              = LANG_MAP.get(language, "English")

    # Normalize "Skip", "Not sure", and empty values to "Not specified"
    if soil_type.lower() in ["skip", "not sure", "नहीं पता", "माहीत नाही", ""]:
        soil_type = "Not specified"
    if ph.lower() in ["skip", "नहीं पता", "माहीत नाही", ""]:
        ph = "Not specified"
    if nitrogen_ppm.lower() in ["skip", "नहीं पता", "माहीत नाही", ""]:
        nitrogen_ppm = "Not specified"
    if phosphorus_ppm.lower() in ["skip", "नहीं पता", "माहीत नाही", ""]:
        phosphorus_ppm = "Not specified"
    if potassium_ppm.lower() in ["skip", "नहीं पता", "माहीत नाही", ""]:
        potassium_ppm = "Not specified"

    if not farmer_id:
        return jsonify({"detail": "farmer_id is required"}), 400
    if not crop:
        return jsonify({"detail": "crop is required"}), 400

    try:
        # Get regional soil hint if soil type is not specified
        soil_hint = ""
        if soil_type.lower() in ["not specified", "unknown", ""]:
            soil_hint = f"\nRegional soil context: {get_regional_soil_hint(location)}"
        
        prompt = SESSION_PROMPT.format(
            lang=lang,
            crop=crop,
            location=location or "Not specified",
            farmer_problem=farmer_problem or "Not specified",
            extra_description=extra_description or "Not specified",
            soil_type=soil_type + soil_hint,
            ph=ph,
            nitrogen_ppm=nitrogen_ppm,
            phosphorus_ppm=phosphorus_ppm,
            potassium_ppm=potassium_ppm,
            water_availability=water_availability,
            budget_range=budget_range,
            weather_context=weather_context,
        )
        raw    = call_gemini(prompt)
        result = clean_json_response(raw)
        if not result:
            return jsonify({"detail": "AI returned an unexpected response. Please try again."}), 502
    except Exception as e:
        print("🔥 GEMINI ERROR:", str(e))
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 503

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
        "weather_context":   weather_context,
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