document.addEventListener("DOMContentLoaded", () => {␍␊
  const medForm = document.getElementById("medForm");
  const medList = document.getElementById("medList");
  const alarmSound = document.getElementById("alarmSound");
  const currentRole = typeof getCurrentRole === "function" ? getCurrentRole() : null;
  const isDoctor = currentRole === "doctor";
  const isEditable = (typeof canEditMedsVitals === "function"
    ? canEditMedsVitals()
    : (typeof canEdit === "function" ? canEdit() : true)) || isDoctor;
  const isFamily = typeof isFamilyRole === "function" ? isFamilyRole() : false;
  const pageContainer = document.querySelector(".page-container");
  const medName = document.getElementById("medName");
  const medDosage = document.getElementById("medDosage");
  const medTime = document.getElementById("medTime");
  const submitButton = medForm ? medForm.querySelector("button[type='submit']") : null;
  const formTitle = medForm ? medForm.querySelector("h2") : null;

  let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
  let editingMedId = null;

  function saveData() {
    localStorage.setItem("medicines", JSON.stringify(medicines));
  }
 function renderReadOnlyNotice() {
    if (!pageContainer) return;
    const notice = document.createElement("div");
    notice.className = "read-only-banner";
    notice.textContent = "Medications are read-only for this role.";
    pageContainer.prepend(notice);
  }

  function isPastTime(time) {
    if (!time) return false;
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    return time < currentTime;
  }

  function setFormState(med) {
    if (!medForm || !submitButton) return;
    if (med) {
      submitButton.textContent = isDoctor ? "Update Prescription" : "Update Medicine";
    } else {
      submitButton.textContent = isDoctor ? "Add Prescription" : "Add Medicine";
    }
  }

  function getSourceMeta(entry) {
    medicines.push(newMed);
      }
      saveData();
      renderMeds();
      medForm.reset();
      editingMedId = null;
      setFormState(null);
    });
  } else if (medForm && !isEditable) {
    medForm.classList.add("hidden");
    renderReadOnlyNotice();
  }

  // Global functions for the buttons
  window.toggleTaken = (id) => {
    if (!isEditable || isDoctor) return;
    const med = medicines.find(m => m.id === id);
    if (med && !(isFamily && isPastTime(med.time))) {
      med.taken = !med.taken;
      saveData();
      renderMeds(); // Re-render to show updated status
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
    if ((isFamily || isDoctor) && isPastTime(med.time)) return;
    editingMedId = id;
    medName.value = med.name || "";
    medDosage.value = med.dosage || "";
    medTime.value = med.time || "";
    setFormState(med);
  };

  // Run the initial render
  renderMeds();

  // Alarm Interval (Only play sound if alarmSound exists on the current page)
  setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    medicines.forEach(med => {
      if (med.time === currentTime && !med.notified) {
        if (alarmSound) alarmSound.play();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Medication Reminder", { body: `Time to take: ${med.name}` });
        }
        med.notified = true;
        saveData();
      }
    });
  }, 30000);
});
