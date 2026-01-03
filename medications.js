document.addEventListener('DOMContentLoaded', () => {

    const currentPage = document.body.getAttribute('data-page');
    const medContainer = document.getElementById('medList');


    let medicines = JSON.parse(localStorage.getItem('medicines')) || [];
    if (currentPage === 'dashboard') {
        renderDashboardMeds();
    }

   
    if (currentPage === 'medications') {
        const medForm = document.getElementById('medForm');
        renderMedsPage();

       
        medForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newMed = {
                id: Date.now(),
                name: document.getElementById('medName').value,
                time: document.getElementById('medTime').value
            };
            medicines.push(newMed);
            saveData();
            renderMedsPage();
            medForm.reset();
        });
    }



    function saveData() {
        localStorage.setItem('medicines', JSON.stringify(medicines));
    }

    
    function renderDashboardMeds() {
        if (!medContainer) return;
        medicines.sort((a, b) => a.time.localeCompare(b.time));
        
        medContainer.innerHTML = medicines.length > 0 
            ? medicines.map(m => `
                <div class="med-item" style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
                    <span><strong>${m.time}</strong></span>
                    <span>${m.name}</span>
                </div>`).join('')
            : '<p style="padding:10px; color:gray;">No meds for today.</p>';
    }

    function renderMedsPage() {
        if (!medContainer) return;
        medicines.sort((a, b) => a.time.localeCompare(b.time));
        
        medContainer.innerHTML = medicines.map(m => `
            <li>
                <span><strong>${m.time}</strong> - ${m.name}</span>
                <button onclick="editMed(${m.id})">Edit</button>
                <button onclick="deleteMed(${m.id})" style="color:red">Delete</button>
            </li>
        `).join('');
    }

    window.deleteMed = (id) => {
        medicines = medicines.filter(m => m.id !== id);
        saveData();
        renderMedsPage();
    };

    window.editMed = (id) => {
        const med = medicines.find(m => m.id === id);
        const newName = prompt("Update Name:", med.name);
        const newTime = prompt("Update Time:", med.time);
        if (newName && newTime) {
            med.name = newName;
            med.time = newTime;
            saveData();
            renderMedsPage();
        }
    };
});
