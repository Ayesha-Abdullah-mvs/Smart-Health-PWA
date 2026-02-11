document.addEventListener("DOMContentLoaded", () => {
  const medForm = document.getElementById("medForm");
  const medList = document.getElementById("medList");
  const alarmSound = document.getElementById("alarmSound");
  
  // Role & Permission Checks
  const currentRole = typeof getCurrentRole === "function" ? getCurrentRole() : null;
  const isDoctor = currentRole === "doctor";
  const isEditable = (typeof canEditMedsVitals === "function" 
    ? canEditMedsVitals() 
    : (typeof canEdit === "function" ? canEdit() : true)) || isDoctor;
  const isFamily = typeof isFamilyRole === "function" ? isFamilyRole() : false;

  const medName = document.getElementById("medName");
  const medDosage = document.getElementById("medDosage");
  const medTime = document.getElementById("medTime");
  const submitButton = medForm ? medForm.querySelector("button[type='submit']") : null;

  let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
  let editingMedId = null;

  function saveData() {
    localStorage.setItem("medicines", JSON.stringify(medicines));
  }

  function isPastTime(time) {
    if (!time) return false;
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    return time < currentTime;
  }

  // --- NEW: RENDER FUNCTION ---
  window.renderMeds = () => {
    if (!medList) return;
    medList.innerHTML = "";

    medicines.forEach(med => {
      const li = document.createElement("li");
      li.className = `med-item ${med.taken ? 'taken' : ''}`;
      li.innerHTML = `
        <div class="med-info">
          <strong>${med.name}</strong> - ${med.dosage} <br>
          <small>Time: ${med.time}</small>
        </div>
        <div class="med-actions">
          <button onclick="toggleTaken('${med.id}')">${med.taken ? '✅' : '🕒'}</button>
          <button onclick="editMed('${med.id}')">✏️</button>
          <button onclick="deleteMed('${med.id}')">🗑️</button>
        </div>
      `;
      medList.appendChild(li);
    });
  };

  // --- FIXED: FORM SUBMISSION ---
  if (medForm && isEditable) {
    medForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (editingMedId) {
        // Update existing
        const index = medicines.findIndex(m => m.id === editingMedId);
        if (index !== -1) {
          medicines[index] = { 
            ...medicines[index], 
            name: medName.value, 
            dosage: medDosage.value, 
            time: medTime.value 
          };
        }
        editingMedId = null;
      } else {
        // Add new
        const newMed = {
          id: Date.now().toString(),
          name: medName.value,
          dosage: medDosage.value,
          time: medTime.value,
          taken: false,
          notified: false
        };
        medicines.push(newMed);
      }

      saveData();
      renderMeds();
      medForm.reset();
      submitButton.textContent = isDoctor ? "Add Prescription" : "Add Medicine";
    });
  } else if (medForm && !isEditable) {
    medForm.classList.add("hidden");
  }

  // --- GLOBAL BUTTON ACTIONS ---
  window.toggleTaken = (id) => {
    if (!isEditable || isDoctor) return;
    const med = medicines.find(m => m.id === id);
    if (med && !(isFamily && isPastTime(med.time))) {
      med.taken = !med.taken;
      saveData();
      renderMeds();
    }
  };

  window.deleteMed = (id) => {
    if (!isEditable || isFamily || isDoctor) return;
    medicines = medicines.filter(m => m.id !== id);
    saveData();
    renderMeds();
  };

  window.editMed = (id) => {
    if (!isEditable) return;
    const med = medicines.find(m => m.id === id);
    if (!med) return;
    editingMedId = id;
    medName.value = med.name;
    medDosage.value = med.dosage;
    medTime.value = med.time;
    submitButton.textContent = "Update Medicine";
  };

  // Initial Run
  renderMeds();

  // Alarm Interval
  setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    medicines.forEach(med => {
      if (med.time === currentTime && !med.notified) {
        if (alarmSound) alarmSound.play().catch(() => console.log("Audio blocked by browser"));
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Medication Reminder", { body: `Time to take: ${med.name}` });
        }
        med.notified = true;
        saveData();
      }
    });
  }, 30000);
});
