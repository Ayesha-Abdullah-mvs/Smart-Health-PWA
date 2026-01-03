document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.getAttribute('data-page');

    
    if (currentPage === 'steps') {
        let currentSteps = parseInt(localStorage.getItem('stepsToday')) || 0;
        let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000;

        updateStepUI();

        function updateStepUI() {
            const progress = Math.min((currentSteps / stepGoal) * 100, 100);
            
            document.getElementById('todaySteps').textContent = currentSteps.toLocaleString();
            document.getElementById('goalText').textContent = `${stepGoal.toLocaleString()} steps`;
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('progressText').textContent = `${Math.round(progress)}% of daily goal`;
            
            const status = document.getElementById('goalStatus');
            if (progress >= 100) {
                status.textContent = "🎉 Goal Achieved!";
            } else {
                status.textContent = "";
            }
        }

        window.editGoal = () => {
            document.getElementById('goalEdit').classList.toggle('hidden');
            document.getElementById('newGoal').value = stepGoal;
        };

        window.saveGoal = () => {
            const newVal = document.getElementById('newGoal').value;
            if (newVal >= 1000) {
                stepGoal = parseInt(newVal);
                localStorage.setItem('stepGoal', stepGoal);
                updateStepUI();
                document.getElementById('goalEdit').classList.add('hidden');
            } else {
                alert("Please enter a goal of at least 1,000 steps.");
            }
        };

        
    }

    
    if (currentPage === 'dashboard') {
        const stepsToday = localStorage.getItem('stepsToday') || "0";
        const stepGoal = localStorage.getItem('stepGoal') || "5000";

        if (document.getElementById('stepsToday')) {
            document.getElementById('stepsToday').textContent = parseInt(stepsToday).toLocaleString();
        }
        if (document.getElementById('stepGoal')) {
            document.getElementById('stepGoal').textContent = parseInt(stepGoal).toLocaleString();
        }
    }
});
