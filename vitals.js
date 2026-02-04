document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vitalsForm");
  const statusMsg = document.getElementById("statusMsg");
  const isEditable = typeof canEdit === "function" ? canEdit() : true;
  const pageContainer = document.querySelector(".page-container");
  const vitalsList = document.getElementById("vitalsList");
  const vitalsEmpty = document.getElementById("vitalsEmpty");

  if (!form) return;

  const getVitalsHistory = () => {
    try {
      const storedData = localStorage.getItem("vitals");
      const parsed = storedData ? JSON.parse(storedData) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Unknown time";
    return date.toLocaleString();
  };

  const renderVitals = () => {
    if (!vitalsList) return;
    const vitalsHistory = getVitalsHistory();
    vitalsList.innerHTML = "";

    if (vitalsEmpty) {
      vitalsEmpty.classList.toggle("hidden", vitalsHistory.length > 0);
    }

    const sortedHistory = vitalsHistory.slice().sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return bTime - aTime;
    });

    sortedHistory.forEach((entry) => {
      const listItem = document.createElement("li");
      listItem.className = "vitals-item";

      const header = document.createElement("div");
      header.className = "vitals-item-header";

      const timeStamp = document.createElement("span");
      timeStamp.className = "vitals-time";
      timeStamp.textContent = formatTimestamp(entry.timestamp);
      header.appendChild(timeStamp);

      const grid = document.createElement("div");
      grid.className = "vitals-item-grid";

      const fields = [
        { label: "Blood Pressure", value: entry.bp || "--" },
        { label: "Heart Rate", value: entry.hr ? `${entry.hr} bpm` : "--" },
        { label: "Temperature", value: entry.temp ? `${entry.temp} °C` : "--" },
        { label: "Sugar Level", value: entry.sl ? `${entry.sl} mg/dl` : "--" }
      ];

      fields.forEach((field) => {
        const item = document.createElement("div");
        item.className = "vitals-value";

        const label = document.createElement("span");
        label.className = "vitals-label";
        label.textContent = field.label;

        const value = document.createElement("span");
        value.className = "vitals-number";
        value.textContent = field.value;

        item.appendChild(label);
        item.appendChild(value);
        grid.appendChild(item);
      });

      listItem.appendChild(header);
      listItem.appendChild(grid);
      vitalsList.appendChild(listItem);
    });
  };

  if (!isEditable) {
    form.classList.add("hidden");
    if (pageContainer) {
      const notice = document.createElement("div");
      notice.className = "read-only-banner";
      notice.textContent = "Family view: vitals are read-only.";
      pageContainer.prepend(notice);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const bp = document.getElementById("bp").value.trim();
    const hr = document.getElementById("hr").value.trim();
    const temp = document.getElementById("temp").value.trim();
    const sl = document.getElementById("sl").value.trim();

    if (!bp || !hr || !temp || !sl) {
      statusMsg.textContent = "Please fill all fields!";
      statusMsg.className = "error"; // Using class for styling
      statusMsg.style.color = "red";
      return;
    }

    const vitalsEntry = {
      bp: bp,
      hr: Number(hr),
      temp: Number(temp),
      sl: Number(sl),
      timestamp: new Date().toISOString()
    };

    const vitalsHistory = getVitalsHistory();

    vitalsHistory.push(vitalsEntry);
    localStorage.setItem("vitals", JSON.stringify(vitalsHistory));

    statusMsg.textContent = "Vitals saved successfully!";
    statusMsg.style.color = "green";

    form.reset();
    renderVitals();
  });

  renderVitals();
});


