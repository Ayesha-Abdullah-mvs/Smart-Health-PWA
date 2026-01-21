document.addEventListener("DOMContentLoaded", () => {

  const stepsCountEl = document.getElementById("stepsCount");
  const goalTextEl = document.getElementById("stepGoalText");
  const progressCircle = document.getElementById("progressCircle");

  const stepsInput = document.getElementById("stepsInput");
  const goalInput = document.getElementById("goalInput");

  const addStepsBtn = document.getElementById("addStepsBtn");
  const updateGoalBtn = document.getElementById("updateGoalBtn");

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = circumference;

  let stepsToday = parseInt(localStorage.getItem("stepsToday")) || 0;
  let stepGoal = parseInt(localStorage.getItem("stepGoal")) || 5000;

  function updateUI() {
    stepsCountEl.textContent = stepsToday;
    goalTextEl.textContent = stepGoal;

    const progress = Math.min(stepsToday / stepGoal, 1);
    const offset = circumference - progress * circumference;
    progressCircle.style.strokeDashoffset = offset;
  }

  addStepsBtn.addEventListener("click", () => {
    const addedSteps = parseInt(stepsInput.value);
    if (!addedSteps || addedSteps <= 0) return;

    stepsToday += addedSteps;
    localStorage.setItem("stepsToday", stepsToday);
    stepsInput.value = "";
    updateUI();
  });

  updateGoalBtn.addEventListener("click", () => {
    const newGoal = parseInt(goalInput.value);
    if (!newGoal || newGoal <= 0) return;

    stepGoal = newGoal;
    localStorage.setItem("stepGoal", stepGoal);
    goalInput.value = "";
    updateUI();
  });

  updateUI();
});
/* --- Automatic Pedometer Logic --- */
/* --- Improved Automatic Pedometer Logic --- */
if (currentPage === 'steps') {
    let currentSteps = parseInt(localStorage.getItem('stepsToday')) || 0;
    let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000;
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let movementThreshold = 1.5;
    let stepDetected = false;

    function requestMotionPermission() {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('devicemotion', handleDeviceMotion);
                    } else {
                        alert("Motion sensor access denied.");
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('devicemotion', handleDeviceMotion);
        }
    }

    function handleDeviceMotion(event) {
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;

        const deltaX = acceleration.x - lastAcceleration.x;
        const deltaY = acceleration.y - lastAcceleration.y;
        const deltaZ = acceleration.z - lastAcceleration.z;
        const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

        if (movement > movementThreshold && !stepDetected) {
            currentSteps++;
            localStorage.setItem('stepsToday', currentSteps);
            updateStepUI();
            stepDetected = true;
            setTimeout(() => { stepDetected = false; }, 300);
        }
        lastAcceleration = acceleration;
    }

    function updateStepUI() {
        const progress = Math.min((currentSteps / stepGoal) * 100, 100);
        document.getElementById('todaySteps').textContent = currentSteps.toLocaleString();
        document.getElementById('goalText').textContent = `${stepGoal.toLocaleString()} steps`;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}% of daily goal`;
        
        const status = document.getElementById('goalStatus');
        if (progress >= 100) status.textContent = "🎉 Goal Achieved!";
    }

    window.saveGoal = () => {
        const newGoal = parseInt(document.getElementById('newGoal').value);
        if (newGoal > 0) {
            stepGoal = newGoal;
            localStorage.setItem('stepGoal', stepGoal);
            updateStepUI();
            document.getElementById('goalEdit').classList.add('hidden');
        }
    };

    requestMotionPermission();
    updateStepUI();
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

async function registerPeriodicSync() {
    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.periodicSync.register('get-latest-steps', {
            minInterval: 60 * 60 * 1000,
        });
    } catch (err) {
        console.error("Periodic Sync failed:", err);
    }
}

document.body.addEventListener('click', registerPeriodicSync, { once: true });

