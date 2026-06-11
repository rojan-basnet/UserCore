
const API_URL =
    window.location.hostname === "localhost"||"127.0.0.1"
        ? "http://localhost:3000"
        : "https://your-production-api.com";

const projectId="yourProjectId"


export const CONFIG = { API_URL: API_URL, projectId: projectId };