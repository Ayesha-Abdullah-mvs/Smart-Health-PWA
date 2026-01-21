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

  if (currentPage === "steps") {
    let lastStepTime = 0;

    const MOVEMENT_THRESHOLD = 0.6;   // was ~1.5 (too slow)
    const STEP_COOLDOWN = 250;         // ms (fast response)
    const STEP_BOOST = 3;              // 1 motion = +3 steps

    function requestMotionPermission() {
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        DeviceMotionEvent.requestPermission()
          .then(permission => {
            if (permission === "granted") {
              window.addEventListener("devicemotion", handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener("devicemotion", handleMotion);
      }
    }

    function handleMotion(event) {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const totalMovement =
        Math.abs(acc.x || 0) +
        Math.abs(acc.y || 0) +
        Math.abs(acc.z || 0);

      const now = Date.now();

      if (
        totalMovement > MOVEMENT_THRESHOLD &&
        now - lastStepTime > STEP_COOLDOWN
      ) {
        stepsToday += STEP_BOOST; // 🚀 BOOSTED STEPS
        localStorage.setItem("stepsToday", stepsToday);
        lastStepTime = now;
        updateUI();
      }
    }

    requestMotionPermission();
  }

  if (currentPage === "dashboard") {
    const s = parseInt(localStorage.getItem("stepsToday")) || 0;
    const g = parseInt(localStorage.getItem("stepGoal")) || 5000;

    const sEl = document.getElementById("stepsToday");
    const gEl = document.getElementById("stepGoal");

    if (sEl) sEl.textContent = s.toLocaleString();
    if (gEl) gEl.textContent = g.toLocaleString();
  }
});
