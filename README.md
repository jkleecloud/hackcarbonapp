# Goodfoot — employee carbon-footprint demo

A responsive, dependency-free prototype for capturing and exploring work-related carbon estimates. It covers commuting, work travel, and remote-work energy, with individual and team views.

## Run locally

Open `index.html` in a modern browser. No install, build step, backend, or API key is needed. The prototype preloads sample data and stores new entries in browser local storage on that device.

You can also serve this folder with any static file server. For example, if Python is installed:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Run with Docker Compose

Start the Nginx web server from this folder:

```powershell
docker compose up
```

Then open `http://localhost:8080`. The Compose service mounts the project files read-only into Nginx, so changes to the static files are served without rebuilding an image. Stop the server with `Ctrl+C`, or run `docker compose down` in another terminal.

## Run the unit tests

Open `tests.html` in a modern browser. The dependency-free test runner checks the shared emissions calculator and reports each result on the page. You can run it locally from `file://` or from the same static file server.

## Demo flow

1. Start on **My footprint** to show the individual footprint, activity breakdown, and sample entries.
2. Open **Add activity** and enter a commute, business trip, or remote-work energy entry. The estimate updates as the inputs change.
3. Save the entry and show the dashboard updating immediately.
4. Open **Team overview** to show the aggregate view and sample team participation.
5. Open **How we calculate** to explain the factors and their limitations.
6. Use the export button to download the demo activities as CSV.

## Local and cloud behavior

The same files run locally and can be published to static hosting (for example, GitHub Pages, Netlify, or Cloudflare Pages). A static deployment has no server component; each browser stores its own data. Data entered on one device does **not** synchronize to other users or to a shared team database.

This is intentionally a prototype rather than the planned production stack: no authentication, access control, shared database, or server-side storage is included. Do not enter real employee or sensitive information.

## Calculation assumptions

The app uses fixed, illustrative factors in `app.js`:

- Commute (return distance × commute days): car 0.192, bus 0.105, train 0.041, bike/walk 0 kg CO2e per passenger-km.
- Work travel (total trip distance): car 0.192, train 0.035, flight 0.255 kg CO2e per passenger-km.
- Remote-work energy: entered kWh/day × days × 0.207 kg CO2e/kWh.
- Remote energy defaults to 1.5 kWh per day in the entry form.

These values are for demonstrating the calculation flow only. They are not verified against a specific region, reporting standard, or current factor source. Replace them with sourced, dated, location-appropriate factors before using the output for organizational decisions or public claims.

## Reset demo data

The first visit seeds sample data. To reset to the original demo, clear this site's local storage in your browser developer tools and reload.
