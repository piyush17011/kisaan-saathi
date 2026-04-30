
from pydantic import BaseModel
from typing import Optional


# -----------------------------
# AUTH
# -----------------------------
class SignupRequest(BaseModel):

    name: str

    phone: str

    password: str

    village: Optional[str] = None


class LoginRequest(BaseModel):

    phone: str

    password: str


# -----------------------------
# SIMPLE AI CHAT
# -----------------------------
class AskRequest(BaseModel):

    farmer_id: str

    question: str

    language: str = "English"


# -----------------------------
# AI FARM SESSION
# -----------------------------
class SessionRequest(BaseModel):

    farmer_id: str

    # BASIC DETAILS
    crop: str

    farmer_problem: Optional[str] = None

    extra_description: Optional[str] = None

    location: Optional[str] = None


    # SOIL DATA
    soil_type: Optional[str] = "Loamy"

    ph: Optional[float] = 6.5

    nitrogen_ppm: Optional[int] = 0

    phosphorus_ppm: Optional[int] = 0

    potassium_ppm: Optional[int] = 0


    # FARM DETAILS
    water_availability: Optional[str] = "Moderate"

    budget_range: Optional[str] = "Medium"


    # LANGUAGE
    language: str = "English"

