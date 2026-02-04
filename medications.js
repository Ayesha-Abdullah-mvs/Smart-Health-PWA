document.addEventListener("DOMContentLoaded", () => {
  const medForm = document.getElementById("medForm");
  const medList = document.getElementById("medList");
  const alarmSound = document.getElementById("alarmSound");
  const isEditable = typeof canEdit === "function" ? canEdit() : true;
  const pageContainer = document.querySelector(".page-container");

  let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

  function saveData() {
    localStorage.setItem("medicines", JSON.stringify(medicines));
  }

  function renderReadOnlyNotice() {
    if (!pageContainer) return;
    const notice = document.createElement("div");
    notice.className = "read-only-banner";
    notice.textContent = "Family view: medications are read-only.";
    pageContainer.prepend(notice);
  }

  function renderMeds() {
    if (!medList) return; // Exit if the list element isn't found
    medList.innerHTML = "";
    
    medicines.sort((a, b) => a.time.localeCompare(b.time));

    medicines.forEach(med => {
      const li = document.createElement("li");
      li.className = "med-item";

      // Determine if we are on the dashboard or medications page
      const isDashboard = document.body.dataset.page === "dashboard";

      if (isDashboard || !isEditable) {
        // Simpler layout for the Dashboard
        li.innerHTML = `
          <div style="display:flex; justify-content:space-between; width:100%; padding: 5px 0;">
            <span><strong>${med.time}</strong> - ${med.name}</span>
            <span>${med.taken ? "✅" : "⏳"}</span>
          </div>
        `;
      } else {
        // Full layout with buttons for the Medications page
        li.innerHTML = `
          <div><strong>${med.time}</strong> — ${med.name}</div>
          <div style="display:flex; gap:10px; align-items:center;">
            <label><input type="checkbox" ${med.taken ? "checked" : ""} onchange="toggleTaken(${med.id})"> Taken</label>
            <button onclick="deleteMed(${med.id})" style="background:#ffe6e6; color:#b00000; border:none; padding:4px 8px; border-radius:6px;">Delete</button>
          </div>
        `;
      }
      medList.appendChild(li);
    });
  }

  // Only attach form listener if the form exists (Prevents errors on dashboard)
  if (medForm && isEditable) {
    medForm.addEventListener("submit", e => {
      e.preventDefault();
      const medName = document.getElementById("medName");
      const medTime = document.getElementById("medTime");
      
      const newMed = {
        id: Date.now(),
        name: medName.value.trim(),
        time: medTime.value,
        taken: false,
        notified: false
      };

      medicines.push(newMed);
      saveData();
      renderMeds();
      medForm.reset();
    });
  } else if (medForm && !isEditable) {
    medForm.classList.add("hidden");
    renderReadOnlyNotice();
  }

  // Global functions for the buttons
  window.toggleTaken = (id) => {
    if (!isEditable) return;
    const med = medicines.find(m => m.id === id);
    if (med) {
      med.taken = !med.taken;
      saveData();
      renderMeds(); // Re-render to show updated status
    }
  };

  window.deleteMed = (id) => {
    if (!isEditable) return;
    medicines = medicines.filter(m => m.id !== id);
    saveData();
    renderMeds();
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
