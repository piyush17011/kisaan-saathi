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

        # Comma-separated: http://localhost:3000,https://ksaathi.onrender.com
        self.ALLOWED_ORIGINS: str     = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()