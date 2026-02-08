function loadLatestVitals() {
  const vitals = JSON.parse(localStorage.getItem("vitals")) || [];

  if (vitals.length === 0) return;

  const latest = vitals[vitals.length - 1];

  document.getElementById("dash-bp").textContent = latest.bp;
  document.getElementById("dash-hr").textContent = latest.hr;
  document.getElementById("dash-temp").textContent = latest.temp + "°C";
}
document.addEventListener("DOMContentLoaded", loadLatestVitals);
window.addEventListener("health-data-updated", (event) => {
  const updateType = event?.detail?.type;
  if (updateType === "vitals") {
    loadLatestVitals();
  }
  if (updateType === "medicines" && typeof renderMeds === "function") {
    renderMeds();
  }
});
