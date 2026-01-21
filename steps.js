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
let stepsToday = parseInt(localStorage.getItem("stepsToday")) || 0;
let lastStepTime = 0;
// Higher minimum threshold to avoid noise, lower maximum to catch steps
let stepThreshold = 10; 
const minStepInterval = 350; // ms (limits steps to ~170 steps/minute)

// Smoothing: Average acceleration over last few readings
let accelQueue = [];
const queueSize = 5;

// Initialize UI
updateUI();

// Request permission for iOS devices (required for Chrome/Safari on iPhone)
if (typeof DeviceMotionEvent.requestPermission === 'function') {
    document.body.addEventListener('click', () => {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response === 'granted') { 
                    window.addEventListener('devicemotion', handleMotion); 
                }
            }).catch(console.error);
    }, { once: true });
} else {
    // Non-iOS or older devices (Android)
    window.addEventListener('devicemotion', handleMotion);
}

function handleMotion(event) {
    // Use accelerationIncludingGravity if linear acceleration is not available
    const acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc) return;

    // 1. Calculate magnitude (using raw data initially)
    let magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);

    // 2. Smooth the signal (reduce noise)
    accelQueue.push(magnitude);
    if (accelQueue.length > queueSize) accelQueue.shift();
    const avgMagnitude = accelQueue.reduce((a, b) => a + b) / accelQueue.length;

    const now = Date.now();
    
    // 3. Improved Peak Detection
    // We look for a significant movement (avgMagnitude > threshold) 
    // AND ensure we aren't counting the same step twice too quickly
    if (avgMagnitude > stepThreshold && (now - lastStepTime) > minStepInterval) {
        stepsToday++;
        localStorage.setItem("stepsToday", stepsToday);
        
        // Use requestAnimationFrame to avoid blocking UI thread
        requestAnimationFrame(updateUI);
        
        lastStepTime = now;
    }
}

function updateUI() {
    // Re-uses your existing UI function
    if (document.getElementById('steps')) {
        document.getElementById('steps').innerText = stepsToday;
    }
}
/* ------------------------------------------ */
