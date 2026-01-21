document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.getAttribute("data-page");

  const stepsCountEl = document.getElementById("stepsCount");
  const goalTextEl = document.getElementById("stepGoalText");
  const progressCircle = document.getElementById("progressCircle");

  const stepsInput = document.getElementById("stepsInput");
  const goalInput = document.getElementById("goalInput");
  const addStepsBtn = document.getElementById("addStepsBtn");
  const updateGoalBtn = document.getElementById("updateGoalBtn");

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  if (progressCircle) {
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;
  }

  let stepsToday = parseInt(localStorage.getItem("stepsToday")) || 0;
  let stepGoal = parseInt(localStorage.getItem("stepGoal")) || 5000;

  function updateUI() {
    if (!stepsCountEl || !goalTextEl || !progressCircle) return;

    stepsCountEl.textContent = stepsToday.toLocaleString();
    goalTextEl.textContent = stepGoal.toLocaleString();

    const progress = Math.min(stepsToday / stepGoal, 1);
    const offset = circumference - progress * circumference;
    progressCircle.style.strokeDashoffset = offset;
  }

 
  if (addStepsBtn) {
    addStepsBtn.addEventListener("click", () => {
      const addedSteps = parseInt(stepsInput.value);
      if (!addedSteps || addedSteps <= 0) return;

      stepsToday += addedSteps;
      localStorage.setItem("stepsToday", stepsToday);
      stepsInput.value = "";
      updateUI();
    });
  }

  if (updateGoalBtn) {
    updateGoalBtn.addEventListener("click", () => {
      const newGoal = parseInt(goalInput.value);
      if (!newGoal || newGoal <= 0) return;

      stepGoal = newGoal;
      localStorage.setItem("stepGoal", stepGoal);
      goalInput.value = "";
      updateUI();
    });
  }

  updateUI();
/* ---------- REALISTIC AUTOMATIC PEDOMETER ---------- */

if (currentPage === 'steps') {

    let stepsToday = parseInt(localStorage.getItem('stepsToday')) || 0;
    let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000;

    let lastStepTime = 0;
    const STEP_INTERVAL = 2000; // 1 step every 2 seconds
    const MOVEMENT_THRESHOLD = 2.2; // ignore sitting/typing noise

    let lastAccel = { x: 0, y: 0, z: 0 };

    function requestMotionPermission() {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(permission => {
                if (permission === 'granted') {
                    window.addEventListener('devicemotion', detectStep);
                }
            });
        } else {
            window.addEventListener('devicemotion', detectStep);
        }
    }

    function detectStep(event) {
        const accel = event.accelerationIncludingGravity;
        if (!accel) return;

        const dx = accel.x - lastAccel.x;
        const dy = accel.y - lastAccel.y;
        const dz = accel.z - lastAccel.z;

        const magnitude = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const now = Date.now();

        if (
            magnitude > MOVEMENT_THRESHOLD &&
            (now - lastStepTime) > STEP_INTERVAL
        ) {
            stepsToday++;
            lastStepTime = now;
            localStorage.setItem('stepsToday', stepsToday);
            updateUI();
        }

        lastAccel = accel;
    }

    function updateUI() {
        const progress = Math.min(stepsToday / stepGoal, 1);
        const offset = circumference - progress * circumference;

        stepsCountEl.textContent = stepsToday.toLocaleString();
        goalTextEl.textContent = stepGoal.toLocaleString();
        progressCircle.style.strokeDashoffset = offset;
    }

    requestMotionPermission();
    updateUI();
}
