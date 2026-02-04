document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vitalsForm");
  const statusMsg = document.getElementById("statusMsg");
  const isEditable = typeof canEdit === "function" ? canEdit() : true;
  const pageContainer = document.querySelector(".page-container");

  if (!form) return;

  if (!isEditable) {
    form.classList.add("hidden");
    if (pageContainer) {
      const notice = document.createElement("div");
      notice.className = "read-only-banner";
      notice.textContent = "Family view: vitals are read-only.";
      pageContainer.prepend(notice);
    }
    return;
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

    let vitalsHistory;
    try {
        const storedData = localStorage.getItem("vitals");
        vitalsHistory = storedData ? JSON.parse(storedData) : [];
        if (!Array.isArray(vitalsHistory)) vitalsHistory = [];
    } catch (err) {
        vitalsHistory = [];
    }

    vitalsHistory.push(vitalsEntry);
    localStorage.setItem("vitals", JSON.stringify(vitalsHistory));

    statusMsg.textContent = "Vitals saved successfully!";
    statusMsg.style.color = "green";

    form.reset();
  });
});


