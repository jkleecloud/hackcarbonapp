from django.db import models


class Employee(models.Model):
    name = models.CharField(max_length=100, unique=True)
    initials = models.CharField(max_length=4)
    team = models.CharField(max_length=100)
    color = models.CharField(max_length=30)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Activity(models.Model):
    ACTIVITY_TYPES = [
        ("commute", "Commute"),
        ("travel", "Work travel"),
        ("remote", "Remote energy"),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name="activities")
    activity_type = models.CharField(max_length=10, choices=ACTIVITY_TYPES)
    mode = models.CharField(max_length=10, blank=True)
    distance_km = models.DecimalField(max_digits=9, decimal_places=1, null=True, blank=True)
    days = models.PositiveSmallIntegerField(null=True, blank=True)
    kwh_per_day = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)
    activity_date = models.DateField()
    description = models.CharField(max_length=200)
    kg_co2e = models.DecimalField(max_digits=12, decimal_places=3)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-activity_date", "-id"]

    def __str__(self):
        return f"{self.employee}: {self.description}"
