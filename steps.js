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
