const taskList = document.getElementById("taskList");
const currentUser = JSON.parse(localStorage.getItem("user"));

// redirect kalau belum login
if (!currentUser) window.location.href = "index.html";

// ambil task
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// render task
function renderTasks() {
  const myTasks = tasks.filter(t => t.assigned === currentUser.email);

  if (myTasks.length === 0) {
    taskList.innerHTML = "<p>No tasks assigned yet.</p>";
    return;
  }

  taskList.innerHTML = myTasks
    .map(
      t => `
      <div class="task-card">

        <div class="task-header">
          <h3 class="task-title"><i class="fa-solid fa-circle-check"></i> ${t.name}</h3>
          <span class="status-badge ${t.status.toLowerCase().replace(" ", "-")}">
            ${t.status === "Pending" ? '<i class="fa-solid fa-hourglass-half"></i>' : t.status === "On Progress" ? '<i class="fa-solid fa-spinner fa-spin"></i>' : '<i class="fa-solid fa-check"></i>'} ${t.status}
          </span>
        </div>
        <p class="task-desc">${t.description}</p>
        <p class="task-deadline"><strong>Deadline:</strong> ${t.deadline}</p>

        <div class="task-actions">
          <select class="status-select" data-id="${t.id}">
            <option value="Pending" ${t.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="On Progress" ${t.status === "On Progress" ? "selected" : ""}>On Progress</option>
            <option value="Done" ${t.status === "Done" ? "selected" : ""}>Done</option>
          </select>
        </div>

      </div>
      `
    )
    .join("");

  // event select dropdown
  document.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", () => {
      const id = select.dataset.id;
      const task = tasks.find(t => t.id == id);

      task.status = select.value;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    });
  });
}

// initial render
renderTasks();

// logout
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}
