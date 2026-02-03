document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.getAttribute('data-page');

    if (currentPage === 'reports') {
        renderReports();
        renderVitalsHistory();
    }

    function renderReports() {
        const medicines = JSON.parse(localStorage.getItem('medicines')) || [];
        const stepsToday = parseInt(localStorage.getItem('stepsToday')) || 0;
        const stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000;

        // Update Summary Stats
        document.getElementById('weeklySteps').textContent = stepsToday.toLocaleString();
        
        const missedMedsCount = medicines.length > 0 ? 0 : "None set";
        document.getElementById('missedMeds').textContent = missedMedsCount;
        
        const alertsCount = stepsToday < (stepGoal / 2) ? 1 : 0;
        document.getElementById('alertsCount').textContent = alertsCount;
        
        // Update Medication List (Using div rows, not table rows)
        const medTable = document.getElementById('medTable');
        if (medicines.length > 0) {
            medTable.innerHTML = medicines.map(med => `
                <div class="report-row">
                    <p>${med.name} <small>(${med.time})</small></p>
                    <span class="status-pill">Scheduled</span>
                </div>
            `).join('');
        } else {
            medTable.innerHTML = '<div class="report-row"><p>No medications found.</p></div>';
        }
    }

    function renderVitalsHistory() {
        const vitals = JSON.parse(localStorage.getItem("vitals")) || [];
        const vitalsContainer = document.getElementById("vitalsTable"); // This is now a div

        if (!vitalsContainer) return;

        vitalsContainer.innerHTML = "";

        if (vitals.length > 0) {
            vitals.forEach(v => {
                const date = new Date(v.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                const row = document.createElement("div");
                row.className = "report-row";
                row.innerHTML = `
                    <div style="display:flex; flex-direction:column; width:100%;">
                        <div style="display:flex; justify-content:space-between; width:100%; border-bottom:1px solid #eee; margin-bottom:5px;">
                            <p style="color:var(--color-red-maroon)">${date}</p>
                            <span class="status-pill">Log</span>
                        </div>
                        <div class="vitals-data-points">
                            <span>BP: ${v.bp}</span>
                            <span>HR: ${v.hr} bpm</span>
                            <span>Temp: ${v.temp}°C</span>
                        </div>
                    </div>
                `;
                vitalsContainer.appendChild(row);
            });
        } else {
            vitalsContainer.innerHTML = '<div class="report-row"><p>No history found.</p></div>';
        }
    }
});

// Helper function for exporting (can be called via a button)
function exportData() {
    const data = {
        vitals: JSON.parse(localStorage.getItem("vitals")) || [],
        medicines: JSON.parse(localStorage.getItem("medicines")) || [],
        stepsToday: localStorage.getItem("stepsToday") || 0,
        stepGoal: localStorage.getItem("stepGoal") || 5000
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "health_report.json";
    link.click();
}
