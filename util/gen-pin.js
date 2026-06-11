
export function generateOTP() {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
}

export async function sendOtpN8n(email, code,name) {
  const response = await fetch(process.env.N8N_AUTOMATION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email,otp: code ,name:name})
  })

  const data=await response.json();
  console.log(data);
}