from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.db import migrations


EMPLOYEES = [
    ("Jordan Lee", "JL", "People & Culture", "peach"),
    ("Amara Okafor", "AO", "Design", "lilac"),
    ("Theo Martin", "TM", "Engineering", "blue"),
    ("Sofia Chen", "SC", "Product", "rose"),
    ("Elliot Reed", "ER", "Engineering", "mint"),
    ("Priya Nair", "PN", "Design", "yellow"),
    ("Mateo Silva", "MS", "Operations", "sky"),
    ("Isla Thompson", "IT", "People & Culture", "lavender"),
]

ACTIVITIES = [
    ("Jordan Lee", "commute", "train", 12, 4, None, 12, "Train commute · 12 km each way"),
    ("Jordan Lee", "remote", "", None, 3, 1.5, 8, "Working from home · 3 days"),
    ("Jordan Lee", "commute", "bike", 4, 2, None, 5, "Bike commute · 4 km each way"),
    ("Amara Okafor", "commute", "bus", 8, 5, None, 12, "Bus commute · 8 km each way"),
    ("Amara Okafor", "remote", "", None, 2, 1.5, 6, "Working from home · 2 days"),
    ("Theo Martin", "commute", "car", 18, 4, None, 11, "Car commute · 18 km each way"),
    ("Theo Martin", "travel", "train", 150, None, None, 9, "Client visit · train · 150 km"),
    ("Sofia Chen", "commute", "train", 7, 3, None, 13, "Train commute · 7 km each way"),
    ("Sofia Chen", "travel", "flight", 780, None, None, 4, "Conference · flight · 780 km"),
    ("Elliot Reed", "commute", "bike", 6, 5, None, 10, "Bike commute · 6 km each way"),
    ("Elliot Reed", "remote", "", None, 4, 2, 7, "Working from home · 4 days"),
    ("Priya Nair", "commute", "bus", 11, 4, None, 12, "Bus commute · 11 km each way"),
    ("Priya Nair", "travel", "train", 90, None, None, 3, "Workshop · train · 90 km"),
    ("Mateo Silva", "commute", "car", 9, 5, None, 9, "Car commute · 9 km each way"),
    ("Mateo Silva", "remote", "", None, 1, 1.5, 2, "Working from home · 1 day"),
    ("Isla Thompson", "commute", "train", 15, 2, None, 11, "Train commute · 15 km each way"),
]


def seed_demo(apps, schema_editor):
    Employee = apps.get_model("footprints", "Employee")
    Activity = apps.get_model("footprints", "Activity")
    employees = {
        name: Employee.objects.create(name=name, initials=initials, team=team, color=color)
        for name, initials, team, color in EMPLOYEES
    }
    commute_factors = {"car": Decimal("0.192"), "bus": Decimal("0.105"), "train": Decimal("0.041"), "bike": Decimal("0"), "walk": Decimal("0")}
    travel_factors = {"car": Decimal("0.192"), "train": Decimal("0.035"), "flight": Decimal("0.255")}
    for name, kind, mode, distance, days, kwh, day, description in ACTIVITIES:
        if kind == "commute":
            kg = Decimal(distance) * 2 * days * commute_factors[mode]
        elif kind == "travel":
            kg = Decimal(distance) * travel_factors[mode]
        else:
            kg = Decimal(str(kwh)) * days * Decimal("0.207")
        Activity.objects.create(
            employee=employees[name],
            activity_type=kind,
            mode=mode,
            distance_km=Decimal(str(distance)) if distance is not None else None,
            days=days,
            kwh_per_day=Decimal(str(kwh)) if kwh is not None else None,
            activity_date=date(2026, 10, day),
            description=description,
            kg_co2e=kg.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP),
        )


def unseed_demo(apps, schema_editor):
    apps.get_model("footprints", "Activity").objects.all().delete()
    apps.get_model("footprints", "Employee").objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [("footprints", "0001_initial")]

    operations = [migrations.RunPython(seed_demo, unseed_demo)]
