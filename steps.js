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

/* ===== REALISTIC DEMO-FRIENDLY PEDOMETER ===== */

if (currentPage === 'steps') {

    let stepsToday = parseInt(localStorage.getItem('stepsToday')) || 0;
    let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000;

    let lastStepTime = 0;
    let lastMagnitude = 0;

    // Tuned for DEMO (walking required, sitting ignored)
    const STEP_THRESHOLD = 12;      // higher = ignores noise
    const STEP_COOLDOWN = 500;      // ms between steps

    function requestMotionPermission() {
        if (typeof DeviceMotionEvent?.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(state => {
                    if (state === 'granted') {
                        window.addEventListener('devicemotion', detectStep);
                    } else {
                        alert("Motion permission denied");
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('devicemotion', detectStep);
        }
    }

    function detectStep(event) {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        // Vector magnitude
        const magnitude = Math.sqrt(
            acc.x * acc.x +
            acc.y * acc.y +
            acc.z * acc.z
        );

        const delta = Math.abs(magnitude - lastMagnitude);
        const now = Date.now();

        // STEP CONDITIONS
        if (
            delta > STEP_THRESHOLD &&
            now - lastStepTime > STEP_COOLDOWN
        ) {
            stepsToday += 1;
            localStorage.setItem('stepsToday', stepsToday);
            updateUI();
            lastStepTime = now;
        }

        lastMagnitude = magnitude;
    }

    requestMotionPermission();
}
