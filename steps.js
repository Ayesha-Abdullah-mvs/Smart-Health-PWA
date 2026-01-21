document.addEventListener("DOMContentLoaded", () => {

  const stepsCountEl = document.getElementById("stepsCount");
  const goalTextEl = document.getElementById("stepGoalText");
  const progressCircle = document.getElementById("progressCircle");

  const stepsInput = document.getElementById("stepsInput");
  const goalInput = document.getElementById("goalInput");

  const addStepsBtn = document.getElementById("addStepsBtn");
  const updateGoalBtn = document.getElementById("updateGoalBtn");
  const startWalkBtn = document.getElementById("startWalkBtn");
  const stopWalkBtn = document.getElementById("stopWalkBtn");

  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = circumference;

  let stepsToday = parseInt(localStorage.getItem("stepsToday")) || 0;
  let stepGoal = parseInt(localStorage.getItem("stepGoal")) || 5000;

  let walkInterval = null;

  function updateUI() {
    stepsCountEl.textContent = stepsToday.toLocaleString();
    goalTextEl.textContent = stepGoal.toLocaleString();

    const progress = Math.min(stepsToday / stepGoal, 1);
    const offset = circumference - progress * circumference;
    progressCircle.style.strokeDashoffset = offset;
  }

  addStepsBtn.addEventListener("click", () => {
    const val = parseInt(stepsInput.value);
    if (!val || val <= 0) return;

    stepsToday += val;
    localStorage.setItem("stepsToday", stepsToday);
    stepsInput.value = "";
    updateUI();
  });

  updateGoalBtn.addEventListener("click", () => {
    const val = parseInt(goalInput.value);
    if (!val || val <= 0) return;

    stepGoal = val;
    localStorage.setItem("stepGoal", stepGoal);
    goalInput.value = "";
    updateUI();
  });

  // 🚶 DEMO WALK MODE (SAFE & REALISTIC)
  startWalkBtn.addEventListener("click", () => {
    if (walkInterval) return;

    walkInterval = setInterval(() => {
      stepsToday += 1;
      localStorage.setItem("stepsToday", stepsToday);
      updateUI();
    }, 2000); // 1 step every 2 seconds
  });

  stopWalkBtn.addEventListener("click", () => {
    clearInterval(walkInterval);
    walkInterval = null;
  });

  updateUI();
});
