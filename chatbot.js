const toggleBtn = document.getElementById("chatbot-toggle");
const chatbot = document.getElementById("chatbot-container");
const closeBtn = document.getElementById("chatbot-close");
const options = document.querySelectorAll(".chat-option");

toggleBtn.addEventListener("click", () => {
  chatbot.classList.toggle("hidden");
});

closeBtn.addEventListener("click", () => {
  chatbot.classList.add("hidden");
});

options.forEach(btn => {
  btn.addEventListener("click", () => {
    const q = btn.dataset.question;
    let reply = "";

    if (q === "meds") {
      reply = "You have 2 medications scheduled today.";
    }
    if (q === "steps") {
      reply = "You have walked 3,200 steps today.";
    }
    if (q === "weekly") {
      reply = "Your weekly health report looks stable.";
    }
    if (q === "monthly") {
      reply = "Monthly report will be generated soon.";
    }

    alert(reply); // temporary (can improve later)
  });
});
