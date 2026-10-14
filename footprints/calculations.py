from decimal import Decimal, ROUND_HALF_UP


FACTORS = {
    "commute": {"car": Decimal("0.192"), "bus": Decimal("0.105"), "train": Decimal("0.041"), "bike": Decimal("0"), "walk": Decimal("0")},
    "travel": {"car": Decimal("0.192"), "train": Decimal("0.035"), "flight": Decimal("0.255")},
    "remote": {"electricity": Decimal("0.207")},
}


def calculate_kg(activity_type, mode="", distance_km=None, days=None, kwh_per_day=None):
    zero = Decimal("0")
    if activity_type == "commute":
        result = (distance_km or zero) * 2 * (days or 0) * FACTORS["commute"].get(mode, zero)
    elif activity_type == "travel":
        result = (distance_km or zero) * FACTORS["travel"].get(mode, zero)
    elif activity_type == "remote":
        result = (kwh_per_day or zero) * (days or 0) * FACTORS["remote"]["electricity"]
    else:
        raise ValueError("Unsupported activity type")
    return result.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP)
