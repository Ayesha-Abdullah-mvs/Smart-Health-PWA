// js/vitals.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vitalsForm");
  const statusMsg = document.getElementById("statusMsg");

  if (!form) {
    console.error("Vitals form not found!");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const bp = document.getElementById("bp").value.trim();
    const hr = document.getElementById("hr").value.trim();
    const temp = document.getElementById("temp").value.trim();

    if (!bp || !hr || !temp) {
      statusMsg.textContent = "Please fill all fields!";
      statusMsg.style.color = "red";
      return;
    }

    // Create vitals object
    const vitalsEntry = {
      bp,
      hr: Number(hr),
      temp: Number(temp),
      timestamp: new Date().toISOString()
    };

    // Get existing vitals array or new array
    let vitalsHistory = [];
    try {
      vitalsHistory = JSON.parse(localStorage.getItem("vitals")) || [];
    } catch (err) {
      vitalsHistory = [];
    }

    // Add new entry to array
    vitalsHistory.push(vitalsEntry);

    // Save back to localStorage
    localStorage.setItem("vitals", JSON.stringify(vitalsHistory));

    // Confirmation message
    statusMsg.textContent = "Vitals saved successfully!";
    statusMsg.style.color = "green";

    // Clear the form
    form.reset();
  });
});
