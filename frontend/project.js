import { CONFIG } from "./config.js";

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

fetchProjectInfo(projectId);

async function fetchProjectInfo(projectId) {
    try {
        const res = await fetch(`${CONFIG.API_URL}/api/users?projectId=${projectId}`);
        if (!res.ok) throw new Error("Failed request");

        const data = await res.json();

        renderProject(data.project);
        renderUsers(data.users);

    } catch (err) {
        document.getElementById("empty").style.display = "block";
        document.getElementById("empty").innerText = "Failed to load data.";
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}

function renderProject(project) {
    document.getElementById("projectSection").style.display = "block";

    document.getElementById("project").innerHTML = `
        <div>
            <h2>${project.name}</h2>
            <div class="meta">Project ID: ${project._id}</div>
        </div>
        <div class="meta">
            Created: ${new Date(project.createdAt).toLocaleString()}
        </div>
    `;
}

function renderUsers(users) {
    const tbody = document.getElementById("users");

    if (!users || users.length === 0) {
        document.getElementById("empty").style.display = "block";
        document.getElementById("empty").innerText = "No users found in this project.";
        return;
    }

    document.getElementById("usersSection").style.display = "block";
    tbody.innerHTML = "";

    users.forEach(user => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <div class="user-info">
                    <img class="pfp" src="${user.profilePic}" />
                    <span title="${user.name}">${user.name}</span>
                </div>
            </td>
            <td title="${user.email}">${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleString()}</td>
        `;

        tbody.appendChild(tr);
    });
}