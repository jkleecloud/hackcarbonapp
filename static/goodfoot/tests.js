(() => {
  "use strict";

  const { calculateKg, FACTORS } = window.GoodfootCalculations;
  const results = [];

  function test(name, run) {
    try {
      run();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({ name, passed: false, detail: error.message });
    }
  }

  function expectKg(entry, expected) {
    const actual = calculateKg(entry);
    if (Math.abs(actual - expected) > 1e-9) {
      throw new Error(`Expected ${expected} kg CO2e, received ${actual}`);
    }
  }

  test("commute counts the return journey and every commute day", () => {
    expectKg({ type: "commute", mode: "train", distanceKm: 12, days: 4 }, 3.936);
  });
  test("commute applies the bus emission factor", () => {
    expectKg({ type: "commute", mode: "bus", distanceKm: 8, days: 5 }, 8.4);
  });
  test("commute applies the car emission factor", () => {
    expectKg({ type: "commute", mode: "car", distanceKm: 10, days: 3 }, 11.52);
  });
  test("bike and walking commutes produce zero emissions", () => {
    expectKg({ type: "commute", mode: "bike", distanceKm: 20, days: 5 }, 0);
    expectKg({ type: "commute", mode: "walk", distanceKm: 3, days: 2 }, 0);
  });
  test("unknown commute modes use a zero factor", () => {
    expectKg({ type: "commute", mode: "scooter", distanceKm: 10, days: 2 }, 0);
  });
  test("missing commute values are treated as zero", () => {
    expectKg({ type: "commute", mode: "car" }, 0);
  });
  test("negative commute distances and day counts are clamped to zero", () => {
    expectKg({ type: "commute", mode: "car", distanceKm: -5, days: 3 }, 0);
    expectKg({ type: "commute", mode: "car", distanceKm: 5, days: -3 }, 0);
  });
  test("work travel applies the train emission factor to total distance", () => {
    expectKg({ type: "travel", mode: "train", distanceKm: 150 }, 5.25);
  });
  test("work travel applies the flight emission factor", () => {
    expectKg({ type: "travel", mode: "flight", distanceKm: 780 }, 198.9);
  });
  test("work travel applies the car emission factor", () => {
    expectKg({ type: "travel", mode: "car", distanceKm: 100 }, 19.2);
  });
  test("unknown travel modes use a zero factor", () => {
    expectKg({ type: "travel", mode: "ferry", distanceKm: 50 }, 0);
  });
  test("negative work-travel distance is clamped to zero", () => {
    expectKg({ type: "travel", mode: "flight", distanceKm: -100 }, 0);
  });
  test("remote energy multiplies daily energy, days, and electricity factor", () => {
    expectKg({ type: "remote", kwhPerDay: 1.5, days: 10 }, 3.105);
  });
  test("remote energy with zero days produces zero emissions", () => {
    expectKg({ type: "remote", kwhPerDay: 1.5, days: 0 }, 0);
  });
  test("negative remote energy values and days are clamped to zero", () => {
    expectKg({ type: "remote", kwhPerDay: -1, days: 5 }, 0);
    expectKg({ type: "remote", kwhPerDay: 1.5, days: -5 }, 0);
  });
  test("unsupported activity types produce zero emissions", () => {
    expectKg({ type: "meal", distanceKm: 10, days: 1 }, 0);
  });
  test("emission factors are exposed read-only for documentation and tests", () => {
    if (FACTORS.commute.train !== 0.041 || FACTORS.travel.flight !== 0.255 ||
        FACTORS.remote.electricity !== 0.207) {
      throw new Error("Expected the documented illustrative emission factors");
    }
    if (Object.isExtensible(FACTORS) || Object.isExtensible(FACTORS.commute)) {
      throw new Error("Emission factor tables should be immutable");
    }
  });

  const list = document.querySelector("#test-results");
  list.innerHTML = results.map((result) => {
    const status = result.passed ? "pass" : "fail";
    const icon = result.passed ? "✓" : "✕";
    const detail = result.detail ? ` — ${escapeHtml(result.detail)}` : "";
    return `<li class="test-result ${status}"><span class="test-result-icon" aria-hidden="true">${icon}</span><span class="test-result-copy">${escapeHtml(result.name)}${detail}</span></li>`;
  }).join("");

  const passed = results.filter((result) => result.passed).length;
  const summary = document.querySelector("#test-status");
  const allPassed = passed === results.length;
  summary.className = `test-status ${allPassed ? "passed" : "failed"}`;
  summary.textContent = allPassed
    ? `All ${passed} tests passed`
    : `${passed} of ${results.length} tests passed`;
  document.title = `${allPassed ? "Passed" : "Failed"} — Goodfoot unit tests`;
  document.documentElement.dataset.tests = allPassed ? "passed" : "failed";

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }
})();
