
const API_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://usercore.onrender.com";

const projectId="yourProjectId"


export const CONFIG = { API_URL: API_URL, projectId: projectId };