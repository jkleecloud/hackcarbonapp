import json
from datetime import date
from decimal import Decimal, InvalidOperation

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET, require_http_methods

from .calculations import calculate_kg
from .models import Activity, Employee


COMMUTE_MODES = {"car", "bus", "train", "bike", "walk"}
TRAVEL_MODES = {"car", "train", "flight"}


def dashboard(request):
    return render(request, "goodfoot/index.html")


@require_GET
def calculation_tests(request):
    return render(request, "goodfoot/tests.html")


def serialize_activity(activity):
    return {
        "id": str(activity.pk),
        "name": activity.employee.name,
        "type": activity.activity_type,
        "mode": activity.mode,
        "distanceKm": float(activity.distance_km) if activity.distance_km is not None else None,
        "days": activity.days,
        "kwhPerDay": float(activity.kwh_per_day) if activity.kwh_per_day is not None else None,
        "date": activity.activity_date.isoformat(),
        "description": activity.description,
        "kg": float(activity.kg_co2e),
    }


def parse_decimal(value, label, required=True):
    if value in (None, "") and not required:
        return None
    try:
        number = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError(f"{label} must be a valid number.")
    if not number.is_finite() or number < 0:
        raise ValueError(f"{label} must be a non-negative finite number.")
    return number


def parse_days(value):
    if isinstance(value, bool) or not (
        isinstance(value, int) or isinstance(value, str) and value.strip().isdigit()
    ):
        raise ValueError("Days must be a whole number.")
    try:
        days = int(value)
    except (TypeError, ValueError):
        raise ValueError("Days must be a whole number.")
    if days < 1 or days > 31:
        raise ValueError("Days must be between 1 and 31.")
    return days


def create_activity(payload):
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a JSON object.")
    activity_type = payload.get("type")
    if not isinstance(activity_type, str) or activity_type not in {"commute", "travel", "remote"}:
        raise ValueError("Choose a valid activity type.")

    employee_name = payload.get("name")
    if not isinstance(employee_name, str):
        raise ValueError("Choose a valid employee.")
    try:
        employee = Employee.objects.get(name=employee_name)
    except Employee.DoesNotExist:
        raise ValueError("Choose a valid employee.")

    try:
        date_value = payload.get("date", "")
        if not isinstance(date_value, str):
            raise TypeError
        activity_date = date.fromisoformat(date_value)
    except (TypeError, ValueError):
        raise ValueError("Enter a valid activity date.")

    mode = ""
    distance_km = None
    days = None
    kwh_per_day = None
    description = ""
    if activity_type in {"commute", "travel"}:
        mode = payload.get("mode", "")
        valid_modes = COMMUTE_MODES if activity_type == "commute" else TRAVEL_MODES
        if not isinstance(mode, str) or mode not in valid_modes:
            raise ValueError("Choose a valid travel mode.")
        distance_km = parse_decimal(payload.get("distanceKm"), "Distance")
        if distance_km.as_tuple().exponent < -1:
            raise ValueError("Distance can have at most one decimal place.")
        maximum = Decimal("1000") if activity_type == "commute" else Decimal("50000")
        if distance_km > maximum:
            raise ValueError(f"Distance must not exceed {maximum:g} km.")
        title = mode.capitalize()
        if activity_type == "commute":
            days = parse_days(payload.get("days"))
            description = f"{title} commute · {distance_km:g} km each way"
        else:
            description = f"{title} work trip · {distance_km:g} km"
    else:
        days = parse_days(payload.get("days"))
        kwh_per_day = parse_decimal(payload.get("kwhPerDay"), "Daily energy")
        if kwh_per_day.as_tuple().exponent < -1:
            raise ValueError("Daily energy can have at most one decimal place.")
        if kwh_per_day > Decimal("100"):
            raise ValueError("Daily energy must not exceed 100 kWh.")
        description = f"Working from home · {days} {'day' if days == 1 else 'days'}"

    kg_co2e = calculate_kg(activity_type, mode, distance_km, days, kwh_per_day)
    return Activity.objects.create(
        employee=employee,
        activity_type=activity_type,
        mode=mode,
        distance_km=distance_km,
        days=days,
        kwh_per_day=kwh_per_day,
        activity_date=activity_date,
        description=description,
        kg_co2e=kg_co2e,
    )


@require_http_methods(["GET", "POST"])
def activities_api(request):
    if request.method == "GET":
        employees = list(Employee.objects.values("name", "initials", "team", "color"))
        activities = [
            serialize_activity(activity)
            for activity in Activity.objects.select_related("employee").all()
        ]
        return JsonResponse({"employees": employees, "entries": activities})

    try:
        payload = json.loads(request.body)
        activity = create_activity(payload)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Request body must contain valid JSON."}, status=400)
    except ValueError as error:
        return JsonResponse({"error": str(error)}, status=400)

    return JsonResponse({"entry": serialize_activity(activity)}, status=201)
