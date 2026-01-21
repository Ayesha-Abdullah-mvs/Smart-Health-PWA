document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.getAttribute("data-page");

  /* ---------- SHARED STATE ---------- */
  let stepsToday = parseInt(localStorage.getItem("stepsToday")) || 0;
  let stepGoal = parseInt(localStorage.getItem("stepGoal")) || 5000;

  /* ---------- UI ELEMENTS ---------- */
  const stepsCountEl = document.getElementById("stepsCount");
  const goalTextEl = document.getElementById("stepGoalText");
  const progressCircle = document.getElementById("progressCircle");

  const stepsInput = document.getElementById("stepsInput");
  const goalInput = document.getElementById("goalInput");
  const addStepsBtn = document.getElementById("addStepsBtn");
  const updateGoalBtn = document.getElementById("updateGoalBtn");

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
    addStepsBtn.addEventListener("click", () => {
      const added = parseInt(stepsInput.value);
      if (!added || added <= 0) return;

      stepsToday += added;
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

  /* ---------- REALISTIC PEDOMETER (DEMO SAFE) ---------- */
  if (currentPage === "steps") {
    let lastMagnitude = 0;
    let lastStepTime = 0;

    const STEP_THRESHOLD = 11;     // ignores hand noise
    const STEP_INTERVAL = 2000;    // 1 step per 2 sec max

    function requestMotionPermission() {
      if (typeof DeviceMotionEvent?.requestPermission === "function") {
        DeviceMotionEvent.requestPermission().then(state => {
          if (state === "granted") {
            window.addEventListener("devicemotion", detectStep);
          }
        });
      } else {
        window.addEventListener("devicemotion", detectStep);
      }
    }

    function detectStep(event) {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const magnitude = Math.sqrt(
        acc.x * acc.x +
        acc.y * acc.y +
        acc.z * acc.z
      );

      const delta = Math.abs(magnitude - lastMagnitude);
      const now = Date.now();

      if (delta > STEP_THRESHOLD && now - lastStepTime > STEP_INTERVAL) {
        stepsToday += 1;
        localStorage.setItem("stepsToday", stepsToday);
        updateUI();
        lastStepTime = now;
      }

      lastMagnitude = magnitude;
    }

    requestMotionPermission();
  }
});
