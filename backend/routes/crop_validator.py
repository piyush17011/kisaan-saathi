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

