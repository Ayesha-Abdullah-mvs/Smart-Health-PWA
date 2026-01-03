const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", function(e){
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(email === "" || password === "") {
    msg.style.color = "red";
    msg.innerText = "Please fill all fields";
    return;
  }

  if(email === "admin@seniors.com" && password === "12345") {
    msg.style.color = "green";
    msg.innerText = "Login Successful 🎉";
    

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);

  } else {
    msg.style.color = "red";
    msg.innerText = "Invalid email or password";
  }
});