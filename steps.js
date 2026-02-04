document.addEventListener("DOMContentLoaded", () => {
    const isEditable = typeof canEdit === "function" ? canEdit() : true;
    const pageContainer = document.querySelector(".page-container");

    // --- Common Data ---
    let stepsToday = parseInt(localStorage.getItem("stepsToday")) || 0;
    let stepGoal = parseInt(localStorage.getItem("stepGoal")) || 5000;

    // --- Dashboard Elements ---
    const dashSteps = document.getElementById("stepsToday");
    const dashGoal = document.getElementById("stepGoal");

    // --- Pedometer Elements ---
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

    function updateUI() {
        // Update Dashboard Page
        if (dashSteps) dashSteps.textContent = stepsToday.toLocaleString();
        if (dashGoal) dashGoal.textContent = stepGoal.toLocaleString();

        // Update Pedometer Page
        if (stepsCountEl) stepsCountEl.textContent = stepsToday.toLocaleString();
        if (goalTextEl) goalTextEl.textContent = stepGoal.toLocaleString();
        
        if (progressCircle) {
            progressCircle.style.strokeDasharray = circumference;
            const progress = Math.min(stepsToday / stepGoal, 1);
            const offset = circumference - (progress * circumference);
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    if (!isEditable) {
        if (pageContainer) {
            const notice = document.createElement("div");
            notice.className = "read-only-banner";
            notice.textContent = "Family view: steps are read-only.";
            pageContainer.prepend(notice);
        }

        document.querySelectorAll(".edit-only").forEach(card => {
            card.classList.add("hidden");
        });

        updateUI();
        return;
    }

    // --- Event Listeners (Only if elements exist) ---
    if (addStepsBtn) {
        addStepsBtn.addEventListener("click", () => {
            const val = parseInt(stepsInput.value);
            if (!val || val <= 0) return;
            stepsToday += val;
            localStorage.setItem("stepsToday", stepsToday);
            stepsInput.value = "";
            updateUI();
        });
    }

    if (updateGoalBtn) {
        updateGoalBtn.addEventListener("click", () => {
            const val = parseInt(goalInput.value);
            if (!val || val <= 0) return;
            stepGoal = val;
            localStorage.setItem("stepGoal", stepGoal);
            goalInput.value = "";
            updateUI();
        });
    }

    let walkInterval = null;
    if (startWalkBtn) {
        startWalkBtn.addEventListener("click", () => {
            if (walkInterval) return;
            walkInterval = setInterval(() => {
                stepsToday += 1;
                localStorage.setItem("stepsToday", stepsToday);
                updateUI();
            }, 2000);
        });
    }

    if (stopWalkBtn) {
        stopWalkBtn.addEventListener("click", () => {
            clearInterval(walkInterval);
            walkInterval = null;
        });
    }

    // Initial Load
    updateUI();
});
