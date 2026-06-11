import { CONFIG } from "../config.js";

function togglePassword() {
    const input = document.getElementById("password");
    const eyeOpen = document.getElementById("eyeOpen");
    const eyeOff = document.getElementById("eyeOff");

    if (input.type === "password") {
        input.type = "text";
        eyeOpen.style.display = "none";
        eyeOff.style.display = "block";
    } else {
        input.type = "password";
        eyeOpen.style.display = "block";
        eyeOff.style.display = "none";
    }
}

document.getElementById("signupForm").onsubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${CONFIG.API_URL}/api/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, projectId: CONFIG.projectId })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message);
    localStorage.setItem("accessToken", data.token);

    alert("Account created");

    console.log(data.token)
    window.location.href = "verify.html";
};