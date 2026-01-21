document.addEventListener("DOMContentLoaded", () => {

  const medForm = document.getElementById("medForm");
  const medList = document.getElementById("medList");
  const alarmSound = document.getElementById("alarmSound");

  let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

  // Ask notification permission once
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  function saveData() {
    localStorage.setItem("medicines", JSON.stringify(medicines));
  }

  function renderMeds() {
    medList.innerHTML = "";

    medicines.sort((a, b) => a.time.localeCompare(b.time));

    medicines.forEach(med => {
      const li = document.createElement("li");
      li.className = "med-item";

      li.innerHTML = `
        <div>
          <strong>${med.time}</strong> — ${med.name}
        </div>

        <div style="display:flex; gap:10px; align-items:center;">
          <label>
            <input type="checkbox" ${med.taken ? "checked" : ""} 
              onchange="toggleTaken(${med.id})">
            Taken
          </label>

          <button 
            onclick="deleteMed(${med.id})" 
            style="background:#ffe6e6; color:#b00000; border:none; padding:4px 8px; border-radius:6px;">
            Delete
          </button>
        </div>
      `;

      medList.appendChild(li);
    });
  }

  medForm.addEventListener("submit", e => {
    e.preventDefault();

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

  // Alarm checker (every 30 seconds)
  setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    medicines.forEach(med => {
      if (med.time === currentTime && !med.notified) {
        triggerAlarm(med);
        med.notified = true;
        saveData();
      }
    });
  }, 30000);

  function triggerAlarm(med) {
    alarmSound.play();

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Medication Reminder", {
        body: `Time to take: ${med.name}`,
        icon: "icon-192.png"
      });
    }
  }

  // Toggle taken
  window.toggleTaken = (id) => {
    const med = medicines.find(m => m.id === id);
    if (med) {
      med.taken = !med.taken;
      saveData();
    }
  };

  // DELETE MEDICINE ✅
  window.deleteMed = (id) => {
    const confirmDelete = confirm("Remove this medicine?");
    if (!confirmDelete) return;

    medicines = medicines.filter(m => m.id !== id);
    saveData();
    renderMeds();
  };

  renderMeds();
});
