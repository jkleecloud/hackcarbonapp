(() => {
  "use strict";

  const FACTORS = Object.freeze({
    commute: Object.freeze({ car: 0.192, bus: 0.105, train: 0.041, bike: 0, walk: 0 }),
    travel: Object.freeze({ car: 0.192, train: 0.035, flight: 0.255 }),
    remote: Object.freeze({ electricity: 0.207 })
  });

  function calculateKg(entry) {
    if (entry.type === "commute") {
      return Math.max(0, Number(entry.distanceKm) || 0) * 2 *
        Math.max(0, Number(entry.days) || 0) * (FACTORS.commute[entry.mode] ?? 0);
    }
    if (entry.type === "travel") {
      return Math.max(0, Number(entry.distanceKm) || 0) *
        (FACTORS.travel[entry.mode] ?? 0);
    }
    if (entry.type === "remote") {
      return Math.max(0, Number(entry.kwhPerDay) || 0) *
        Math.max(0, Number(entry.days) || 0) * FACTORS.remote.electricity;
    }
    return 0;
  }

  window.GoodfootCalculations = Object.freeze({ FACTORS, calculateKg });
})();
