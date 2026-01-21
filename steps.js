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
let lastAcceleration = { x: 0, y: 0, z: 0 };
let stepThreshold = 12; // Sensitivity: lower is more sensitive, higher is stricter
let lastStepTime = 0;

// Request permission for iOS devices (required for Chrome/Safari on iPhone)
if (typeof DeviceMotionEvent.requestPermission === 'function') {
    document.body.addEventListener('click', () => {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response === 'granted') { window.addEventListener('devicemotion', handleMotion); }
            }).catch(console.error);
    }, { once: true });
} else {
    // Non-iOS or older devices
    window.addEventListener('devicemotion', handleMotion);
}

function handleMotion(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    // Calculate total acceleration (magnitude)
    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const delta = Math.abs(magnitude - lastAcceleration.magnitude || 0);
    
    const now = Date.now();
    // Simple peak detection: if force exceeds threshold and it's been > 300ms since last step
    if (magnitude > stepThreshold && (now - lastStepTime) > 300) {
        stepsToday++;
        localStorage.setItem("stepsToday", stepsToday);
        updateUI(); // Re-uses your existing UI function
        lastStepTime = now;
    }
    
    lastAcceleration.magnitude = magnitude;
}

