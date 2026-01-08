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
    taskList.innerHTML = "<p>Tidak ada tugas yang diberikan.</p>";
    return;
  }

  taskList.innerHTML = myTasks.map(t => `
    <div class="task-card">

      <div class="task-header">
        <h3 class="task-title"><i class="fa-solid fa-circle-check"></i> ${t.name}</h3>
        <span class="status-badge ${t.status.toLowerCase().replace(" ", "-")}">
          ${t.status}
        </span>
      </div>

      <p class="task-desc">${t.description}</p>
      <p class="task-deadline"><strong>Deadline:</strong> ${t.deadline}</p>

      <div class="task-actions">

        ${!t.proofFileBase64 ? `
          <select class="status-select" data-id="${t.id}" ${t.status === "Waiting Approval" ? "disabled" : ""}>
            <option value="Pending" ${t.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="On Progress" ${t.status === "On Progress" ? "selected" : ""}>On Progress</option>
            <option value="Done" ${t.status === "Done" ? "selected" : ""}>Done</option>
          </select>

          ${t.status === "Done" ? `
            <input type="file" class="upload-input" data-id="${t.id}">
            <button class="upload-btn" data-id="${t.id}">Upload Bukti</button>
          ` : ""}
        ` : `
          <button class="view-proof-btn" data-id="${t.id}">
            <i class="fa-solid fa-eye"></i> Lihat Bukti
          </button>
          <span class="approved">Task selesai ✔</span>
        `}
      </div>

    </div>
  `).join("");

  // Event listener dropdown status
  document.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", () => {
      const id = select.dataset.id;
      const task = tasks.find(t => t.id == id);
      task.status = select.value;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    });
  });

  // Event listener upload
  document.querySelectorAll(".upload-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const input = document.querySelector(`.upload-input[data-id="${id}"]`);
      const file = input.files[0];

      if (!file) return alert("Pilih file dulu!");

      const reader = new FileReader();
      reader.onload = function(e) {
        const base64 = e.target.result;
        const task = tasks.find(t => t.id == id);
        task.proofFileName = file.name;
        task.proofFileBase64 = base64;
        task.status = "Done"; // tetap Done setelah upload

        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
      };
      reader.readAsDataURL(file);
    });
  });

  // Event listener lihat bukti
  document.querySelectorAll(".view-proof-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const task = tasks.find(t => t.id == id);
      if (!task || !task.proofFileBase64) return;

      const arr = task.proofFileBase64.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){ u8arr[n] = bstr.charCodeAt(n); }
      const blob = new Blob([u8arr], {type: mime});
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
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
