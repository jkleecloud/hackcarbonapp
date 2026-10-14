# Goodfoot — employee carbon-footprint demo

A responsive Django application for capturing and exploring work-related carbon estimates. It covers commuting, work travel, and remote-work energy, with individual and team views. Django stores employee and activity records in SQLite.

## Run locally

Install Python 3.10 or newer, then from this folder create and activate a virtual environment and install the dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Apply the migrations and start Django:

```powershell
python manage.py migrate
python manage.py runserver
```

Open `http://127.0.0.1:8000`. Migrations create the SQLite database in `data/db.sqlite3` and seed the demo employees and activities.

## Run with Docker Compose

Build and start the Django web app from this folder:

```powershell
docker compose up --build
```

Open `http://localhost:8080`. SQLite is stored in the `goodfoot_data` Docker volume and survives container recreation. Stop with `Ctrl+C`, or run `docker compose down`. To remove the stored database as well, run `docker compose down --volumes`.

## Run the unit tests

Run the Django tests with:

```powershell
python manage.py test
```

The browser-based calculator tests are also available at `http://127.0.0.1:8000/tests/`.

## Demo flow

1. Start on **My footprint** to show the individual footprint, activity breakdown, and sample entries.
2. Open **Add activity** and enter a commute, business trip, or remote-work energy entry. The estimate updates as the inputs change.
3. Save the entry and show the dashboard updating immediately.
4. Open **Team overview** to show the aggregate view and sample team participation.
5. Open **How we calculate** to explain the factors and their limitations.
6. Use the export button to download the demo activities as CSV.

## Local and cloud behavior

Activity data is held in the server's SQLite database and shared by users of that running instance. The included configuration is for local development and demos; production deployment needs a production-grade WSGI server, secure environment-specific settings, backups, and authentication/access controls.

This remains a prototype: no authentication or access control is included. Do not expose it publicly or enter sensitive employee information.

## Calculation assumptions

The app uses fixed, illustrative factors in `footprints/calculations.py` (and mirrors them in the browser preview calculator):

- Commute (return distance × commute days): car 0.192, bus 0.105, train 0.041, bike/walk 0 kg CO2e per passenger-km.
- Work travel (total trip distance): car 0.192, train 0.035, flight 0.255 kg CO2e per passenger-km.
- Remote-work energy: entered kWh/day × days × 0.207 kg CO2e/kWh.
- Remote energy defaults to 1.5 kWh per day in the entry form.

These values are for demonstrating the calculation flow only. They are not verified against a specific region, reporting standard, or current factor source. Replace them with sourced, dated, location-appropriate factors before using the output for organizational decisions or public claims.

## Reset demo data

For a local run, stop Django, delete `data/db.sqlite3`, then run `python manage.py migrate` to recreate the database and seed the original demo data. With Docker Compose, run `docker compose down --volumes` and then `docker compose up --build`.
