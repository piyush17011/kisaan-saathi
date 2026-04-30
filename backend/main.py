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

# Connect to MongoDB on startup
connect_db()

# Register blueprints
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
