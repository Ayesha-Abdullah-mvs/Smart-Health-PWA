document.addEventListener("DOMContentLoaded", () => {

  const medForm = document.getElementById("medForm");
  const medList = document.getElementById("medList");
  const alarmSound = document.getElementById("alarmSound");

  let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

  // Ask notification permission once
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // Save
  function saveData() {
    localStorage.setItem("medicines", JSON.stringify(medicines));
  }

  // Render
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
        <div>
          <label>
            <input type="checkbox" ${med.taken ? "checked" : ""} 
              onchange="toggleTaken(${med.id})">
            Taken
          </label>
        </div>
      `;

      medList.appendChild(li);
    });
  }

  // Add medicine
  medForm.addEventListener("submit", e => {
    e.preventDefault();

    const newMed = {
      id: Date.now(),
      name: medName.value,
      time: medTime.value,
      taken: false,
      notified: false
    };

    medicines.push(newMed);
    saveData();
    renderMeds();
    medForm.reset();
  });

  // Alarm checker (runs every 30 seconds)
  setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5);

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

  // Checkbox handler
  window.toggleTaken = (id) => {
    const med = medicines.find(m => m.id === id);
    if (med) {
      med.taken = !med.taken;
      saveData();
    }
  };

  renderMeds();
});
