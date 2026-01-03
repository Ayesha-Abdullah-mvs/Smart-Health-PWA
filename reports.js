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
