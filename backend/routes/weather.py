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
