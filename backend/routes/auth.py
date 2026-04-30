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
