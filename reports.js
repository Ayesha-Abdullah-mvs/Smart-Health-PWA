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
});



