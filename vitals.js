document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.getAttribute('data-page');

    if (currentPage === 'vitals') {
        const vitalsForm = document.getElementById('vitalsForm');

        
        const storedVitals = JSON.parse(localStorage.getItem('vitals'));
        if (storedVitals) {
            document.getElementById('bp').value = storedVitals.bp || '';
            document.getElementById('hr').value = storedVitals.hr || '';
            document.getElementById('temp').value = storedVitals.temp || '';
        }

        vitalsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const vitalsData = {
                bp: document.getElementById('bp').value,
                hr: document.getElementById('hr').value + ' bpm',
                temp: document.getElementById('temp').value + '°C',
                lastUpdated: new Date().toLocaleString()
            };

            localStorage.setItem('vitals', JSON.stringify(vitalsData));

            alert('Vitals saved successfully!');
             
        });
    }


    if (currentPage === 'dashboard') {
        const storedVitals = JSON.parse(localStorage.getItem('vitals'));
        
        if (storedVitals) {
            if (document.getElementById('bp')) document.getElementById('bp').textContent = storedVitals.bp;
            if (document.getElementById('hr')) document.getElementById('hr').textContent = storedVitals.hr;
            if (document.getElementById('temp')) document.getElementById('temp').textContent = storedVitals.temp;
        } else {
            // Set default/placeholder text if no data exists
            if (document.getElementById('bp')) document.getElementById('bp').textContent = '--';
            if (document.getElementById('hr')) document.getElementById('hr').textContent = '--';
            if (document.getElementById('temp')) document.getElementById('temp').textContent = '--';
        }
        
    }
});
