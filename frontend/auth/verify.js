import { CONFIG } from "../config.js";


const input = document.getElementById("otpInput");
const boxes = document.querySelectorAll(".box");

input.addEventListener("input", () => {
    let value = input.value.replace(/\D/g, "");
    input.value = value;

    boxes.forEach((box, i) => {
        box.textContent = value[i] || "";
    });
});

async function verify() {
    if (input.value.length !== 6) {
        alert("Enter 6 digit OTP");
        return;
    }
    const projectId = CONFIG.projectId;
    const token = localStorage.getItem("accessToken");
    try {

        const response = await fetch(`${CONFIG.API_URL}/api/auth/verify-email`, {
            method: "POST",

            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ projectId, otp: input.value })
        })

        const data = await response.json();
        console.log(data)

    } catch (err) {
        console.log(err)
    }

}

async function resend() {
    console.log("Resending OTP...");

    // here call your backend / n8n webhook
    const projectId = CONFIG.projectId;
    const token = localStorage.getItem("accessToken");
    try {

        const response = await fetch(`${CONFIG.API_URL}/api/auth/resend-email-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ projectId })
        })

        const data = await response.json();
        console.log(data)

    } catch (err) {
        console.log(err)
    }
}