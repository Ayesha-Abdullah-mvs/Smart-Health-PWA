document.addEventListener("DOMContentLoaded", () => {

  const currentPage = document.body.getAttribute("data-page");
  if (currentPage !== "steps") return;

  /* ---------- ELEMENTS ---------- */
  const stepsCountEl = document.getElementById("stepsCount");
  const goalTextEl = document.getElementById("stepGoalText");
  const progressCircle = document.getElementById("progressCircle");

  const stepsInput = document.getElementById("stepsInput");
  const goalInput = document.getElementById("goalInput");
  const addStepsBtn = document.getElementById("addStepsBtn");
  const updateGoalBtn = document.getElementById("updateGoalBtn");

  /* ---------- SAFE STORAGE ---------- */
  let stepsToday = parseInt(localStorage.getItem("stepsToday")) || 0;
  let stepGoal = parseInt(localStorage.getItem("stepGoal")) || 5000;

  /* ---------- CIRCLE SETUP ---------- */
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = circumference;

  /* ---------- UI UPDATE ---------- */
  function updateUI() {
    stepsCountEl.textContent = stepsToday.toLocaleString();
    goalTextEl.textContent = stepGoal.toLocaleString();

    const progress = Math.min(stepsToday / stepGoal, 1);
    const offset = circumference - progress * circumference;

    progressCircle.style.strokeDashoffset = offset;
  }

  /* ---------- ADD STEPS (DEMO FRIENDLY) ---------- */
  addStepsBtn.addEventListener("click", () => {
    const addedSteps = parseInt(stepsInput.value);

    if (!addedSteps || addedSteps <= 0) return;

    stepsToday += addedSteps;
    localStorage.setItem("stepsToday", stepsToday);

    stepsInput.value = "";
    updateUI();
  });

  /* ---------- UPDATE GOAL ---------- */
  updateGoalBtn.addEventListener("click", () => {
    const newGoal = parseInt(goalInput.value);

    if (!newGoal || newGoal <= 0) return;

    stepGoal = newGoal;
    localStorage.setItem("stepGoal", stepGoal);

    goalInput.value = "";
    updateUI();
  });

  /* ---------- INITIAL LOAD ---------- */
  updateUI();

});
