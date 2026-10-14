import json
from decimal import Decimal

from django.test import TestCase
from django.urls import reverse

from .calculations import calculate_kg
from .models import Activity, Employee


class CalculationTests(TestCase):
    def test_calculates_return_commute(self):
        self.assertEqual(calculate_kg("commute", "train", Decimal("12"), 4), Decimal("3.936"))

    def test_calculates_remote_energy(self):
        self.assertEqual(calculate_kg("remote", days=10, kwh_per_day=Decimal("1.5")), Decimal("3.105"))
        self.assertEqual(calculate_kg("remote", days=1, kwh_per_day=Decimal("1.5")), Decimal("0.311"))

    def test_calculates_work_travel(self):
        self.assertEqual(calculate_kg("travel", "flight", Decimal("780")), Decimal("198.900"))


class ActivitiesApiTests(TestCase):
    def test_lists_seeded_employees_and_activities(self):
        response = self.client.get(reverse("activities-api"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["employees"]), 8)
        self.assertEqual(len(response.json()["entries"]), 16)

    def test_creates_activity_and_calculates_emissions_server_side(self):
        employee = Employee.objects.get(name="Jordan Lee")
        before = Activity.objects.count()
        payload = {
            "name": employee.name,
            "type": "commute",
            "mode": "train",
            "distanceKm": 12,
            "days": 4,
            "date": "2026-10-14",
        }
        response = self.client.post(
            reverse("activities-api"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Activity.objects.count(), before + 1)
        self.assertEqual(response.json()["entry"]["kg"], 3.936)

    def test_rejects_invalid_input_without_writing(self):
        before = Activity.objects.count()
        response = self.client.post(
            reverse("activities-api"),
            data=json.dumps({"name": "Jordan Lee", "type": "commute", "mode": "rocket", "distanceKm": 10, "days": 2, "date": "2026-10-14"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Activity.objects.count(), before)

    def test_rejects_non_object_json_without_writing(self):
        before = Activity.objects.count()
        response = self.client.post(
            reverse("activities-api"),
            data=json.dumps(["not", "an", "activity"]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Activity.objects.count(), before)
