import { CONFIG } from "./config.js";
const form = document.getElementById("form");
const projetsContainer = document.querySelector('.projects-container');
const { projectName } = form.elements;

console.log(CONFIG)


init();

projetsContainer.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;

    window.location.href = `project.html?id=${li.dataset.id}`;
});

form.onsubmit = async (e) => {
    e.preventDefault();

    const nameStr = projectName.value.trim();
    if (!nameStr) return alert("Cannot add Empty project");

    try {
        const response = await fetch(`${CONFIG.API_URL}/api/project/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nameStr })
        });

        if (!response.ok) throw new Error("FAILED TO ADD PROJECT");

        const data = await response.json();
        form.reset();
        addProjectToScreen(data.newProject);

    } catch (error) {
        console.error(error.message);
    }
};

async function handleFetchProjects() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/project`);
        if (!response.ok) throw new Error("FAILED TO FETCH PROJECT");

        const data = await response.json();
        return data.projects;

    } catch (err) {
        console.error(err.message);
        return [];
    }
}

async function init() {
    const projects = await handleFetchProjects();
    showProjects(projects);
}

function showProjects(projects) {
    if (!projects || projects.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No projects yet";
        li.className = "is-empty";
        projetsContainer.appendChild(li);
        return;
    }

    projects.forEach(addProjectToScreen);
}

function addProjectToScreen(project) {
    const li = document.createElement("li");
    li.className = "ind-proj";
    li.dataset.id = project._id;
    li.innerHTML = `
        <div style="font-weight:600;">${project.name}</div>
        <div style="font-size:12px; opacity:0.6;">Click to open</div>
    `;
    projetsContainer.appendChild(li);
}