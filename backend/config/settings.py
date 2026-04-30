import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "kisaan_saathi")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    PORT: int = int(os.getenv("PORT", 8000))

    @property
    def origins(self):
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
