from flask import Blueprint, request, jsonify
import requests
import random
import os

market_bp = Blueprint("market", __name__)

# Official OGD (Open Government Data) API — backed by Agmarknet data.
# Register for a free API key at: https://data.gov.in/user/register
# Then set the DATAGOV_API_KEY environment variable.
DATAGOV_API  = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
DATAGOV_KEY  = os.environ.get("DATAGOV_API_KEY", "")   # ← set this in your env

# Optional secondary endpoint: Agmarknet's internal dashboard API.
# This powers the agmarknet.gov.in 2.0 UI. It has no public docs and
# requires specific headers; included here as a best-effort fallback.
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

    # Normalise whatever shape the internal API returns into OGD-style records
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

    # 1️⃣  Try data.gov.in OGD API (official, needs your own free key)
    try:
        records = _fetch_datagov(commodity)
        if records:
            source = "data.gov.in (Agmarknet)"
    except Exception as exc:
        print(f"[market] data.gov.in fetch failed: {exc}")

    # 2️⃣  Try Agmarknet internal dashboard API as fallback
    if not records:
        try:
            records = _fetch_agmarknet_internal(commodity)
            if records:
                source = "agmarknet.gov.in"
        except Exception as exc:
            print(f"[market] Agmarknet internal fetch failed: {exc}")

    # 3️⃣  Build response from live data
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

    # 4️⃣  Fallback: estimated prices
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