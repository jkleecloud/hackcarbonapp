(() => {
  "use strict";

  const STORAGE_KEY = "goodfoot-demo-activities-v1";
  const EMPLOYEES = [
    { name: "Jordan Lee", initials: "JL", team: "People & Culture", color: "peach" },
    { name: "Amara Okafor", initials: "AO", team: "Design", color: "lilac" },
    { name: "Theo Martin", initials: "TM", team: "Engineering", color: "blue" },
    { name: "Sofia Chen", initials: "SC", team: "Product", color: "rose" },
    { name: "Elliot Reed", initials: "ER", team: "Engineering", color: "mint" },
    { name: "Priya Nair", initials: "PN", team: "Design", color: "yellow" },
    { name: "Mateo Silva", initials: "MS", team: "Operations", color: "sky" },
    { name: "Isla Thompson", initials: "IT", team: "People & Culture", color: "lavender" }
  ];
  const calculateKg = window.GoodfootCalculations.calculateKg;
  const TYPE_META = {
    commute: { label: "Commute", icon: "↗", color: "commute-icon" },
    travel: { label: "Work travel", icon: "✈", color: "travel-icon" },
    remote: { label: "Remote energy", icon: "⌂", color: "home-icon" }
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const numberFormat = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

  function id() {
    return globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function makeDemoEntries() {
    const day = (n) => `2026-10-${String(n).padStart(2, "0")}`;
    return [
      { name: "Jordan Lee", type: "commute", mode: "train", distanceKm: 12, days: 4, date: day(12), description: "Train commute · 12 km each way" },
      { name: "Jordan Lee", type: "remote", kwhPerDay: 1.5, days: 3, date: day(8), description: "Working from home · 3 days" },
      { name: "Jordan Lee", type: "commute", mode: "bike", distanceKm: 4, days: 2, date: day(5), description: "Bike commute · 4 km each way" },
      { name: "Amara Okafor", type: "commute", mode: "bus", distanceKm: 8, days: 5, date: day(12), description: "Bus commute · 8 km each way" },
      { name: "Amara Okafor", type: "remote", kwhPerDay: 1.5, days: 2, date: day(6), description: "Working from home · 2 days" },
      { name: "Theo Martin", type: "commute", mode: "car", distanceKm: 18, days: 4, date: day(11), description: "Car commute · 18 km each way" },
      { name: "Theo Martin", type: "travel", mode: "train", distanceKm: 150, date: day(9), description: "Client visit · train · 150 km" },
      { name: "Sofia Chen", type: "commute", mode: "train", distanceKm: 7, days: 3, date: day(13), description: "Train commute · 7 km each way" },
      { name: "Sofia Chen", type: "travel", mode: "flight", distanceKm: 780, date: day(4), description: "Conference · flight · 780 km" },
      { name: "Elliot Reed", type: "commute", mode: "bike", distanceKm: 6, days: 5, date: day(10), description: "Bike commute · 6 km each way" },
      { name: "Elliot Reed", type: "remote", kwhPerDay: 2, days: 4, date: day(7), description: "Working from home · 4 days" },
      { name: "Priya Nair", type: "commute", mode: "bus", distanceKm: 11, days: 4, date: day(12), description: "Bus commute · 11 km each way" },
      { name: "Priya Nair", type: "travel", mode: "train", distanceKm: 90, date: day(3), description: "Workshop · train · 90 km" },
      { name: "Mateo Silva", type: "commute", mode: "car", distanceKm: 9, days: 5, date: day(9), description: "Car commute · 9 km each way" },
      { name: "Mateo Silva", type: "remote", kwhPerDay: 1.5, days: 1, date: day(2), description: "Working from home · 1 day" },
      { name: "Isla Thompson", type: "commute", mode: "train", distanceKm: 15, days: 2, date: day(11), description: "Train commute · 15 km each way" }
    ].map((entry) => ({ id: id(), kg: calculateKg(entry), ...entry }));
  }

  function readEntries() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((entry) => entry && EMPLOYEES.some((person) => person.name === entry.name) && TYPE_META[entry.type] && Number.isFinite(entry.kg))) return parsed;
      }
      const seeded = makeDemoEntries();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    } catch (error) {
      console.warn("Goodfoot demo is running without browser storage.", error);
      return makeDemoEntries();
    }
  }

  let entries = readEntries();
  let toastTimeout;

  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.warn("Could not save Goodfoot demo data in this browser.", error);
      showToast("Could not save on this device. Check browser storage settings.");
    }
  }

  function formatKg(value) {
    return numberFormat.format(Number.isFinite(value) ? value : 0);
  }

  function formatDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return Number.isNaN(date.getTime()) ? "Date not set" : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
  }

  function totalsFor(personName = null) {
    const scoped = personName ? entries.filter((entry) => entry.name === personName) : entries;
    return {
      commute: scoped.filter((entry) => entry.type === "commute").reduce((sum, entry) => sum + entry.kg, 0),
      travel: scoped.filter((entry) => entry.type === "travel").reduce((sum, entry) => sum + entry.kg, 0),
      remote: scoped.filter((entry) => entry.type === "remote").reduce((sum, entry) => sum + entry.kg, 0),
      count: scoped.length
    };
  }

  function renderPersonal() {
    const totals = totalsFor("Jordan Lee");
    const total = totals.commute + totals.travel + totals.remote;
    $("#personal-total").textContent = formatKg(total);
    $("#commute-total").textContent = formatKg(totals.commute);
    $("#travel-total").textContent = formatKg(totals.travel);
    $("#remote-total").textContent = formatKg(totals.remote);
    $("#commute-detail").textContent = `${entries.filter((entry) => entry.name === "Jordan Lee" && entry.type === "commute").length} commute ${entries.filter((entry) => entry.name === "Jordan Lee" && entry.type === "commute").length === 1 ? "entry" : "entries"}`;
    $("#travel-detail").textContent = `${entries.filter((entry) => entry.name === "Jordan Lee" && entry.type === "travel").length} work ${entries.filter((entry) => entry.name === "Jordan Lee" && entry.type === "travel").length === 1 ? "trip" : "trips"} logged`;
    $("#remote-detail").textContent = `${entries.filter((entry) => entry.name === "Jordan Lee" && entry.type === "remote").length} remote ${entries.filter((entry) => entry.name === "Jordan Lee" && entry.type === "remote").length === 1 ? "entry" : "entries"}`;
    $("#personal-comparison").textContent = total > 0 ? "Your footprint is taking shape — thanks for logging." : "Log an activity to start seeing your footprint.";
    renderTrend(total);
    renderDonut(totals);
    renderRecent();
    $("#my-entry-count").textContent = entries.filter((entry) => entry.name === "Jordan Lee").length;
  }

  function renderTrend(total) {
    const values = [total * 0.63, total * 0.72, total * 0.58, total * 0.86, total];
    const max = Math.max(...values, 1);
    const points = values.map((value, index) => `${12 + index * 25},${55 - (value / max) * 37}`).join(" ");
    const dots = values.map((value, index) => `<circle cx="${12 + index * 25}" cy="${55 - (value / max) * 37}" r="1.8" fill="#5d9a6d"/>`).join("");
    $("#personal-chart").innerHTML = `<svg viewBox="0 0 112 62" preserveAspectRatio="none" role="img" aria-label="Illustrative weekly trend from ${formatKg(values[0])} to ${formatKg(total)} kilograms"><defs><linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#a5cda8" stop-opacity=".24"/><stop offset="100%" stop-color="#a5cda8" stop-opacity=".01"/></linearGradient></defs><path d="M ${points} L 112 62 L 12 62 Z" fill="url(#trend-fill)"/><polyline points="${points}" fill="none" stroke="#70a77b" stroke-width="1.5" vector-effect="non-scaling-stroke"/>${dots}</svg>`;
  }

  function renderDonut(totals) {
    const values = [totals.commute, totals.travel, totals.remote];
    const total = values.reduce((sum, value) => sum + value, 0);
    const container = $("#breakdown-chart");
    if (total <= 0) {
      container.innerHTML = '<div class="donut-empty"><span>No entries yet</span></div>';
      $("#breakdown-insight").textContent = "Log a few activities to see what makes up your footprint.";
      return;
    }
    const colors = ["#70a982", "#d99a70", "#d3b65f"];
    const circumference = 2 * Math.PI * 38;
    let offset = 0;
    const segments = values.map((value, index) => {
      const length = (value / total) * circumference;
      const segment = `<circle cx="50" cy="50" r="38" fill="none" stroke="${colors[index]}" stroke-width="11" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}"/>`;
      offset += length;
      return segment;
    }).join("");
    container.innerHTML = `<div class="donut-wrap" role="img" aria-label="Footprint breakdown: commute ${formatKg(totals.commute)}, work travel ${formatKg(totals.travel)}, remote energy ${formatKg(totals.remote)} kilograms"><svg viewBox="0 0 100 100">${segments}</svg><div class="donut-center"><div><strong>${formatKg(total)}</strong><small>kg CO<sub>2</sub>e</small></div></div></div>`;
    const largest = Math.max(...values);
    const category = ["Commute", "Work travel", "Remote energy"][values.indexOf(largest)];
    const share = Math.round((largest / total) * 100);
    $("#breakdown-insight").textContent = `${category} makes up ${share}% of your logged footprint.`;
  }

  function renderRecent() {
    const recent = entries.filter((entry) => entry.name === "Jordan Lee").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    const list = $("#recent-activities");
    if (!recent.length) {
      list.innerHTML = '<div class="activity-empty">No activities yet. Log your first one to get started.</div>';
      return;
    }
    list.innerHTML = recent.map((entry) => {
      const meta = TYPE_META[entry.type];
      return `<div class="activity-row"><span class="activity-row-icon ${meta.color}">${meta.icon}</span><span class="activity-row-copy"><strong>${escapeHtml(entry.description)}</strong><small>${formatDate(entry.date)}</small></span><span class="activity-row-value">${formatKg(entry.kg)} kg</span></div>`;
    }).join("");
  }

  function renderTeam() {
    const total = totalsFor();
    const overall = total.commute + total.travel + total.remote;
    const participating = new Set(entries.map((entry) => entry.name)).size;
    $("#team-total").textContent = formatKg(overall);
    $("#team-people").textContent = participating;
    $("#team-entries").textContent = entries.length;
    const categories = [
      { key: "commute", label: "Commute", color: "comm", value: total.commute },
      { key: "travel", label: "Work travel", color: "travel", value: total.travel },
      { key: "remote", label: "Remote energy", color: "remote", value: total.remote }
    ];
    const max = Math.max(...categories.map((item) => item.value), 1);
    $("#team-bars").innerHTML = categories.map((item) => {
      const height = Math.max(item.value > 0 ? 3 : 0, Math.round((item.value / max) * 140));
      return `<div class="team-bar-group"><span class="team-bar-total">${formatKg(item.value)}</span><div class="team-bar" style="height:${height}px" aria-label="${item.label}: ${formatKg(item.value)} kg"><span class="team-bar-segment ${item.color}" style="height:100%"></span></div><span class="team-bar-label">${item.label}</span></div>`;
    }).join("");
    $("#team-members").innerHTML = categories.map((item) => {
      const count = entries.filter((entry) => entry.type === item.key).length;
      const label = item.key === "travel" ? "Work travel" : item.key === "remote" ? "Remote energy" : "Commute";
      return `<div class="team-member-row"><span class="team-pulse-dot ${item.color}"></span><span class="team-member-name">${label}</span><span class="member-activity">Team entries</span><span class="member-total">${count}</span></div>`;
    }).join("") + `<div class="team-participation-note">${participating} of ${EMPLOYEES.length} demo colleagues have contributed. Individual activity and totals are not shown here.</div>`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function renderAll() {
    renderPersonal();
    renderTeam();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2700);
  }

  function navigate(view) {
    if (!$(`#view-${view}`)) return;
    $$(".view-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `view-${view}`));
    $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
    const selected = $(`.nav-item[data-view="${view}"]`);
    $("#breadcrumb-current").textContent = selected ? selected.textContent.trim().replace(/\s+\d+$/, "") : view;
    if (view === "activity") {
      $("#activity-date").value ||= new Date().toISOString().slice(0, 10);
      updateEstimate();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fillEmployeeSelect() {
    $("#employee-select").innerHTML = EMPLOYEES.map((person) => `<option value="${person.name}">${person.name}</option>`).join("");
    $("#employee-select").value = "Jordan Lee";
  }

  function renderTypeFields() {
    const type = $('input[name="activity-type"]:checked').value;
    const target = $("#type-fields");
    if (type === "commute") {
      target.innerHTML = `<div class="form-row"><div class="form-field"><label class="form-label" for="mode-select">TRAVEL MODE</label><select class="form-control" id="mode-select"><option value="train">Train</option><option value="bus">Bus</option><option value="car">Car</option><option value="bike">Bike</option><option value="walk">Walk</option></select></div><div class="form-field"><label class="form-label" for="distance-input">ONE-WAY DISTANCE (KM)</label><input class="form-control" id="distance-input" type="number" min="0" max="1000" step="0.1" value="10" required></div></div><div class="form-row"><div class="form-field"><label class="form-label" for="days-input">COMMUTE DAYS</label><input class="form-control" id="days-input" type="number" min="1" max="31" step="1" value="3" required></div></div>`;
    } else if (type === "travel") {
      target.innerHTML = `<div class="form-row"><div class="form-field"><label class="form-label" for="mode-select">TRAVEL MODE</label><select class="form-control" id="mode-select"><option value="train">Train</option><option value="car">Car</option><option value="flight">Flight</option></select></div><div class="form-field"><label class="form-label" for="distance-input">TOTAL DISTANCE (KM)</label><input class="form-control" id="distance-input" type="number" min="0" max="50000" step="1" value="100" required></div></div><p class="form-hint">Enter the total distance across all legs of your trip.</p>`;
    } else {
      target.innerHTML = `<div class="form-row"><div class="form-field"><label class="form-label" for="days-input">REMOTE WORK DAYS</label><input class="form-control" id="days-input" type="number" min="1" max="31" step="1" value="3" required></div><div class="form-field"><label class="form-label" for="energy-input">EXTRA HOME ENERGY (KWH / DAY)</label><input class="form-control" id="energy-input" type="number" min="0" max="100" step="0.1" value="1.5" required></div></div><p class="form-hint">Estimate the extra household energy used while working from home.</p>`;
    }
    $$("#type-fields input, #type-fields select").forEach((input) => input.addEventListener("input", updateEstimate));
    updateEstimate();
  }

  function getFormEntry() {
    const type = $('input[name="activity-type"]:checked').value;
    const entry = {
      name: $("#employee-select").value,
      type,
      date: $("#activity-date").value
    };
    if (type === "commute") {
      entry.mode = $("#mode-select").value;
      entry.distanceKm = Number($("#distance-input").value);
      entry.days = Number($("#days-input").value);
      entry.description = `${entry.mode[0].toUpperCase()}${entry.mode.slice(1)} commute · ${formatKg(entry.distanceKm)} km each way`;
    } else if (type === "travel") {
      entry.mode = $("#mode-select").value;
      entry.distanceKm = Number($("#distance-input").value);
      entry.description = `${entry.mode[0].toUpperCase()}${entry.mode.slice(1)} work trip · ${formatKg(entry.distanceKm)} km`;
    } else {
      entry.kwhPerDay = Number($("#energy-input").value);
      entry.days = Number($("#days-input").value);
      entry.description = `Working from home · ${entry.days} ${entry.days === 1 ? "day" : "days"}`;
    }
    entry.kg = calculateKg(entry);
    return entry;
  }

  function updateEstimate() {
    if (!$("#estimate-value") || !$("#type-fields").children.length) return;
    const entry = getFormEntry();
    $("#estimate-value").innerHTML = `${formatKg(entry.kg)} <small>kg CO<sub>2</sub>e</small>`;
  }

  function downloadCsv(scope) {
    const personal = scope === "personal";
    const header = personal
      ? ["Activity", "Description", "Date", "Emissions (kg CO2e)"]
      : ["Activity", "Number of activities", "Emissions (kg CO2e)"];
    const rows = personal
      ? entries.filter((entry) => entry.name === "Jordan Lee").map((entry) => [TYPE_META[entry.type].label, entry.description, entry.date, entry.kg.toFixed(3)])
      : Object.keys(TYPE_META).map((type) => {
        const matching = entries.filter((entry) => entry.type === type);
        const emissions = matching.reduce((sum, entry) => sum + entry.kg, 0);
        return [TYPE_META[type].label, matching.length, emissions.toFixed(3)];
      });
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = personal ? "goodfoot-my-activities.csv" : "goodfoot-team-summary.csv";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(personal ? "Your activities have been exported." : "The aggregated team summary has been exported.");
  }

  function init() {
    fillEmployeeSelect();
    renderTypeFields();
    $("#activity-date").value = new Date().toISOString().slice(0, 10);
    renderAll();

    $$(".nav-item").forEach((item) => item.addEventListener("click", () => navigate(item.dataset.view)));
    $$("[data-go]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.go)));
    $$('input[name="activity-type"]').forEach((input) => input.addEventListener("change", () => {
      $$(".type-option").forEach((option) => option.classList.toggle("selected", $("input", option).checked));
      renderTypeFields();
    }));
    $("#activity-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const entry = getFormEntry();
      if (!entry.date || entry.kg < 0 || !Number.isFinite(entry.kg)) {
        $("#form-message").textContent = "Please check the activity details and try again.";
        return;
      }
      entry.id = id();
      entries.unshift(entry);
      saveEntries();
      renderAll();
      $("#form-message").textContent = "Activity saved — thanks for adding to the picture.";
      showToast("Activity saved on this device.");
      setTimeout(() => navigate("dashboard"), 650);
    });
    $("#export-button").addEventListener("click", () => downloadCsv("personal"));
    $("#team-export-button").addEventListener("click", () => downloadCsv("team"));
    $(".period-button").addEventListener("click", () => showToast("Demo reporting period: October 2026."));
  }

  init();
})();
