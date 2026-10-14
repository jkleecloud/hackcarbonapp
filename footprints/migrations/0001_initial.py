from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Employee",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, unique=True)),
                ("initials", models.CharField(max_length=4)),
                ("team", models.CharField(max_length=100)),
                ("color", models.CharField(max_length=30)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Activity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("activity_type", models.CharField(choices=[("commute", "Commute"), ("travel", "Work travel"), ("remote", "Remote energy")], max_length=10)),
                ("mode", models.CharField(blank=True, max_length=10)),
                ("distance_km", models.DecimalField(blank=True, decimal_places=1, max_digits=9, null=True)),
                ("days", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("kwh_per_day", models.DecimalField(blank=True, decimal_places=1, max_digits=6, null=True)),
                ("activity_date", models.DateField()),
                ("description", models.CharField(max_length=200)),
                ("kg_co2e", models.DecimalField(decimal_places=3, max_digits=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("employee", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="activities", to="footprints.employee")),
            ],
            options={"ordering": ["-activity_date", "-id"]},
        ),
    ]
