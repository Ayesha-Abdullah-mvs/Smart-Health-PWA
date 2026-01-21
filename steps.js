document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.getAttribute('data-page');

    /* ---------- SHARED STATE ---------- */
    // Use string keys for localStorage
    let stepsToday = parseInt(localStorage.getItem('stepsToday')) || 0;
    let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000;

    /* ---------- UI ELEMENTS ---------- */
    const stepsCountEl = document.getElementById('stepsCount');
    const goalTextEl = document.getElementById('stepGoalText');
    const progressCircle = document.getElementById('progressCircle');
    const stepsInput = document.getElementById('stepsInput');
    const goalInput = document.getElementById('goalInput');
    const addStepsBtn = document.getElementById('addStepsBtn');
    const updateGoalBtn = document.getElementById('updateGoalBtn');

    /* ---------- CIRCLE SETUP ---------- */
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    if (progressCircle) {
        progressCircle.style.strokeDasharray = circumference;
    }

    function updateUI() {
        if (!stepsCountEl || !goalTextEl || !progressCircle) return;
        stepsCountEl.textContent = stepsToday.toLocaleString();
        goalTextEl.textContent = stepGoal.toLocaleString();
        const progress = Math.min(stepsToday / stepGoal, 1);
        const offset = circumference - progress * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }

    /* ---------- MANUAL CONTROLS ---------- */
    if (addStepsBtn) {
        addStepsBtn.addEventListener('click', () => { // Corrected event name
            const added = parseInt(stepsInput.value);
            if (!added || added <= 0) return;
            stepsToday += added;
            localStorage.setItem('stepsToday', stepsToday); // Corrected key
            stepsInput.value = ''; // Clear input
            updateUI();
        });
    }

    if (updateGoalBtn) {
        updateGoalBtn.addEventListener('click', () => { // Corrected event name
            const newGoal = parseInt(goalInput.value);
            if (!newGoal || newGoal <= 0) return;
            stepGoal = newGoal;
            localStorage.setItem('stepGoal', stepGoal); // Corrected key
            goalInput.value = ''; // Clear input
            updateUI();
        });
    }

    updateUI();

    /* ---------- DEMO-SAFE REALISTIC PEDOMETER ---------- */
    if (currentPage === 'steps') { // Ensure 'steps' is a string
        let stepsToday = parseInt(localStorage.getItem('stepsToday')) || 0; // Re-fetch from storage for demo
        let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000; // Re-fetch from storage for demo
        let lastStepTime = 0;
        let motionBuffer = [];
        const BUFFER_SIZE = 5; // Tuned for OPEN DAY DEMO
        const STEP_THRESHOLD = 6.5; // walking-level motion
        const STEP_COOLDOWN = 2000; // 1 step per ~2 sec

        function requestMotionPermission() {
            if (typeof DeviceMotionEvent?.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(state => {
                        if (state === 'granted') {
                            window.addEventListener('devicemotion', detectStep);
                        }
                    })
                    .catch(
