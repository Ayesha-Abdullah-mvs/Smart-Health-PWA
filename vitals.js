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

   
    const vitalsEntry = {
      bp,
      hr: Number(hr),
      temp: Number(temp),
      timestamp: new Date().toISOString()
    };

   
    let vitalsHistory;
    try {
        const storedData = JSON.parse(localStorage.getItem("vitals"));
        vitalsHistory = Array.isArray(storedData) ? storedData : [];
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
