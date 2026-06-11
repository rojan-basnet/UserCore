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

document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${CONFIG.API_URL}/api/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message);

    if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
    }

    alert("Login successful");
    window.location.href = "/";
};