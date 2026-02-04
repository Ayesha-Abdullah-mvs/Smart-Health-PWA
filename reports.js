document.addEventListener('DOMContentLoaded', () => {
    // 1. Ensure the data-page check is correct
    const currentPage = document.body.getAttribute('data-page');
    console.log("Current Page detected:", currentPage);
    const isEditable = typeof canEdit === "function" ? canEdit() : true;
    const pageContainer = document.querySelector(".page-container");

    if (currentPage === 'reports') {
        if (!isEditable && pageContainer) {
            const notice = document.createElement("div");
            notice.className = "read-only-banner";
            notice.textContent = "Family/Doctor view: reports are read-only.";
            pageContainer.prepend(notice);
        }
        renderReports();
        renderVitalsHistory();
    }

    function renderReports() {
        // Try to get data - check your 'key' names in localStorage!
        const medicines = JSON.parse(localStorage.getItem('medicines')) || [];
        const stepsToday = parseInt(localStorage.getItem('stepsToday')) || 0;
        const stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000;

        console.log("Medicines found:", medicines);

        // Update Summary Stats
        const weeklyStepsEl = document.getElementById('weeklySteps');
        if (weeklyStepsEl) weeklyStepsEl.textContent = stepsToday.toLocaleString();
        
        const missedMedsEl = document.getElementById('missedMeds');
        if (missedMedsEl) {
            missedMedsEl.textContent = medicines.length > 0 ? "0" : "None set";
        }
        
        const alertsCountEl = document.getElementById('alertsCount');
        if (alertsCountEl) {
            alertsCountEl.textContent = stepsToday < (stepGoal / 2) ? "1" : "0";
        }
        
        // Update Medication List
        const medTable = document.getElementById('medTable');
        if (medTable) {
            if (medicines.length > 0) {
                medTable.innerHTML = medicines.map(med => `
                    <div class="report-row">
                        <p>${med.name} <small>(${med.time || 'No Time'})</small></p>
                        <span class="status-pill">Scheduled</span>
                    </div>
                `).join('');
            } else {
                medTable.innerHTML = '<div class="report-row"><p>No medications found.</p></div>';
            }
        }
    }

    function renderVitalsHistory() {
        const vitals = JSON.parse(localStorage.getItem("vitals")) || [];
        const vitalsContainer = document.getElementById("vitalsTable");

        console.log("Vitals found:", vitals);

        if (!vitalsContainer) return;

        vitalsContainer.innerHTML = "";

        if (vitals.length > 0) {
            vitals.forEach(v => {
                // Ensure date is valid
                const dateStr = v.timestamp ? new Date(v.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "N/A";
                
                const row = document.createElement("div");
                row.className = "report-row";
                row.innerHTML = `
                    <div style="display:flex; flex-direction:column; width:100%;">
                        <div style="display:flex; justify-content:space-between; width:100%; border-bottom:1px solid #eee; margin-bottom:5px;">
                            <p style="color:var(--color-red-maroon)">${dateStr}</p>
                            <span class="status-pill">Log</span>
                        </div>
                        <div class="vitals-data-points">
                            <span>BP: ${v.bp || '--'}</span>
                            <span>SL: ${v.sl || v.sugar || '--'}</span> 
                            <span>HR: ${v.hr || '--'} bpm</span>
                            <span>Temp: ${v.temp || '--'}°C</span>
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
