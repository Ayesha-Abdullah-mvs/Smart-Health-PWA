document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.getAttribute('data-page');

    
    if (currentPage === 'reports') {
        renderReports();

        function renderReports() {
            const medicines = JSON.parse(localStorage.getItem('medicines')) || [];
            const stepsToday = parseInt(localStorage.getItem('stepsToday')) || 0;
            const stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000;

            document.getElementById('weeklySteps').textContent = stepsToday.toLocaleString();
            
            
            const missedMedsCount = medicines.length > 0 ? 0 : "None set";
            document.getElementById('missedMeds').textContent = missedMedsCount;
            
            
            const alertsCount = stepsToday < (stepGoal / 2) ? 1 : 0;
            document.getElementById('alertsCount').textContent = alertsCount;
            
            const medTable = document.getElementById('medTable');
            if (medicines.length > 0) {
                medTable.innerHTML = medicines.map(med => `
                    <tr>
                        <td>${med.name} (${med.time})</td>
                        <td><span class="status-pill status-taken">Scheduled</span></td>
                    </tr>
                `).join('');
            } else {
                medTable.innerHTML = '<tr><td colspan="2">No medications found.</td></tr>';
            }
        }
    }
    if (currentPage === 'dashboard') {
       
    }
});
document.addEventListener("DOMContentLoaded", () => {
  const vitals = JSON.parse(localStorage.getItem("vitals")) || [];
  const tbody = document.querySelector("#vitalsTable tbody");

  // Clear old rows first
  tbody.innerHTML = "";

  vitals.forEach(v => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(v.timestamp).toLocaleString()}</td>
      <td>${v.bp}</td>
      <td>${v.hr}</td>
      <td>${v.temp}°C</td>
    `;
    tbody.appendChild(row);
  });
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
  link.download = "data.json";
  link.click();
}
function exportData() {
  // 1. Get data from localStorage
  const vitals = JSON.parse(localStorage.getItem("vitals")) || [];
  const medicines = JSON.parse(localStorage.getItem("medicines")) || [];
  const stepsToday = localStorage.getItem("stepsToday") || 0;
  const stepGoal = localStorage.getItem("stepGoal") || 5000;

  // 2. Calculate summary logic (similar to your Python script)
  const totalEntries = vitals.length;
  let avgHR = 0;
  if (totalEntries > 0) {
    const sumHR = vitals.reduce((sum, v) => sum + parseInt(v.hr || 0), 0);
    avgHR = Math.round(sumHR / totalEntries);
  }

  // 3. Build a Human-Readable String
  let report = `SMART HEALTH PWA – REPORT SUMMARY\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n`;
  report += `------------------------------------------\n\n`;
  report += `ACTIVITY:\n`;
  report += `- Steps Today: ${stepsToday}\n`;
  report += `- Daily Goal: ${stepGoal}\n`;
  report += `- Status: ${stepsToday >= stepGoal ? "✅ Goal Achieved" : "❌ Goal Not Met"}\n\n`;

  report += `VITALS SUMMARY:\n`;
  report += `- Total Entries recorded: ${totalEntries}\n`;
  report += `- Average Heart Rate: ${avgHR} bpm\n\n`;

  report += `MEDICATIONS:\n`;
  if (medicines.length > 0) {
    medicines.forEach(m => {
      report += `- ${m.name} (Scheduled for: ${m.time})\n`;
    });
  } else {
    report += `- No medications listed.\n`;
  }

  report += `\n--- End of Report ---`;

  // 4. Download as a .txt file
  const blob = new Blob([report], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Health_Report_${new Date().toISOString().slice(0,10)}.txt`;
  link.click();
}

});


