// ---------------------
// Manager JS (refactored)
// ---------------------

const sidebar = document.getElementById("sidebar");
const menuList = document.getElementById("menuList");
const pageTitle = document.getElementById("pageTitle");
const content = document.getElementById("content");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
const logoutBtn = document.getElementById("logoutBtn");

// --- default sample tasks (used once if no tasks exist) ---
const defaultTasks = [
  { id: 1, name: "Design Homepage", description: "Create a modern homepage design.", assigned: "employee@mail.com", status: "Pending", deadline: "2023-08-15" },
  { id: 2, name: "Update Website", description: "Update the website with new features.", assigned: "employee@mail.com", status: "Pending", deadline: "2023-08-20" },
  { id: 3, name: "Fix Bugs", description: "Resolve reported bugs from users.", assigned: "employee@mail.com", status: "On Progress", deadline: "2023-08-25" },
  { id: 4, name: "Write Documentation", description: "Document the new features added.", assigned: "employee@mail.com", status: "Done", deadline: "2023-08-30" },
  { id: 5, name: "Deploy to Production", description: "Deploy the application to production environment.", assigned: "employee@mail.com", status: "Pending", deadline: "2023-09-05" }
];

// --- require login check ---
const currentUser = JSON.parse(localStorage.getItem("user") || "null");
if (!currentUser) {
  // For development convenience: if no user stored, create a manager user
  // REMOVE this block in production if you don't want auto-login dev behavior.
  localStorage.setItem("user", JSON.stringify({ id: 1, email: "manager@mail.com", role: { id: 1, name: "Manager" } }));
  localStorage.setItem("users", JSON.stringify([
    { id: 1, email: "manager@mail.com", role: { id: 1, name: "Manager" } },
    { id: 2, email: "employee@mail.com", role: { id: 2, name: "Employee" } }
  ]));
  localStorage.setItem("tasks", JSON.stringify(defaultTasks));
  window.location.reload();
}

// --- ensure tasks exist ---
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
if (!tasks || tasks.length === 0) {
  tasks = defaultTasks;
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// --- role based menus ---
const managerMenus = [
  { name: "Dashboard", page: "dashboard", icon: "📊" },
  { name: "Manage Employee", page: "manageEmployee", icon: "👥" },
  { name: "Manage Task", page: "managerTask", icon: "🗂️" },
  { name: "Employee Reports", page: "employeereport", icon: "📄" }
];

function buildMenu() {
  menuList.innerHTML = managerMenus.map(m => {
    return `<div class="menu-item" data-page="${m.page}">
              <span class="mi-icon">${m.icon}</span>
              <span class="mi-label">${m.name}</span>
            </div>`;
  }).join("");

  // attach click handlers
  document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const page = item.dataset.page;
      loadPage(page);
    });
  });
}

// --- toggle sidebar collapse ---
toggleSidebarBtn.addEventListener("click", () => {
  const collapsed = sidebar.classList.toggle("collapsed");
  if (collapsed) {
    sidebar.style.width = "72px";
    document.querySelector(".main-content").style.marginLeft = "72px";
  } else {
    sidebar.style.width = "260px";
    document.querySelector(".main-content").style.marginLeft = "260px";
  }
});

// --- logout ---
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

// --- unified loadPage ---
function loadPage(page) {
  // only manager allowed to see these pages in our simplified logic
  if (currentUser.role.id === 1) {
    if (page === "dashboard") renderDashboard();
    else if (page === "manageEmployee") renderEmployeeList();
    else if (page === "managerTask") renderManagerTask();
    else if (page === "employeereport") renderEmployeeReports();
    else renderDashboard();
  } else {
    renderEmployeeTask();
  }
}

// --- RENDER DASHBOARD ---
function renderDashboard(){
  pageTitle.textContent = "Dashboard";

  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
  const employees = allUsers.filter(u => u.role?.id === 2);

  const allTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const totalTasks = allTasks.length;
  const pending = allTasks.filter(t => t.status === "Pending").length;
  const progress = allTasks.filter(t => t.status === "On Progress").length;
  const completed = allTasks.filter(t => t.status === "Done").length;
  const lastTasks = allTasks.slice(-8).reverse();

  content.innerHTML = `
    <div class="dashboard-cards">
      <div class="dash-card">
        <h3>Total Employees</h3>
        <span>${employees.length}</span>
      </div>
      <div class="dash-card">
        <h3>Total Tasks</h3>
        <span>${totalTasks}</span>
      </div>
      <div class="dash-card">
        <h3>Completed Tasks</h3>
        <span>${completed}</span>
      </div>
    </div>

    <div class="task-overview">
      <h3>Task Overview</h3>
      <div class="task-overview-row">
        <div class="tov-item"><div class="tov-title">Pending</div><div class="tov-number">${pending}</div></div>
        <div class="tov-item"><div class="tov-title">In Progress</div><div class="tov-number">${progress}</div></div>
        <div class="tov-item"><div class="tov-title">Done</div><div class="tov-number">${completed}</div></div>
      </div>
    </div>

    <div class="recent-task-table">
      <h3>Recent Tasks</h3>
      <table>
        <thead>
          <tr><th>Title</th><th>Assigned</th><th>Deadline</th><th>Status</th></tr>
        </thead>
        <tbody id="recentBody">
          ${ lastTasks.map(t => `
            <tr>
              <td><strong>${escapeHtml(t.name)}</strong><div style="color:var(--muted);font-size:13px">${escapeHtml(t.description || '')}</div></td>
              <td>${escapeHtml(t.assigned || '')}</td>
              <td>${escapeHtml(t.deadline || '')}</td>
              <td><span class="status-badge ${badgeClass(t.status)}">${escapeHtml(t.status)}</span></td>
            </tr>
          `).join("") }
        </tbody>
      </table>
    </div>
  `;
}

// --- MANAGE EMPLOYEE ---
function renderEmployeeList(){
  pageTitle.textContent = "Manage Employee";
  let allUsers = JSON.parse(localStorage.getItem("users") || "[]");
  let employees = allUsers.filter(u => u.role?.id === 2);

  content.innerHTML = `
  <div class="pretty-card" style="padding:20px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); background-color:#fff;">
    <h3 class="card-title" style="margin-bottom:16px; font-size:18px; color:#1a73e8;">Add New Employee</h3>
    <form id="addEmployeeForm" class="pretty-form" style="display:flex; flex-direction:column; gap:12px;">
      <input type="email" id="newEmpEmail" placeholder="Employee email..." required
             style="padding:10px; border-radius:8px; border:1px solid #e6eefc; font-size:14px; width:100%; transition: border-color 0.2s;"
             onfocus="this.style.borderColor='#1a73e8'" onblur="this.style.borderColor='#e6eefc'" />
      
      <input type="text" id="newEmpPassword" placeholder="Default password..." value="12345" required
             style="padding:10px; border-radius:8px; border:1px solid #e6eefc; font-size:14px; width:100%; transition: border-color 0.2s;"
             onfocus="this.style.borderColor='#1a73e8'" onblur="this.style.borderColor='#e6eefc'" />
      
      <button type="submit"
              style="padding:10px; border-radius:8px; border:none; background-color:#1a73e8; color:white; font-weight:bold; cursor:pointer; transition: background 0.2s;"
              onmouseover="this.style.backgroundColor='#1669c1'" onmouseout="this.style.backgroundColor='#1a73e8'">
        + Add Employee
      </button>
    </form>
  </div>


    <div class="pretty-card" style="margin-top:16px;">
      <h3 class="card-title">Employee List</h3>
      <div class="task-table-modern">
        ${ employees.length > 0 ? employees.map(emp => `
          <div class="task-row">
            <div class="task-cell">${escapeHtml(emp.email)}</div>
            <div class="task-cell"><span class="role-badge">Employee</span></div>
            <div class="task-cell">${escapeHtml(emp.password || "12345")}</div>
            <div class="task-cell">
              <button class="add-btn edit-emp" data-id="${emp.id}">✏️ Edit</button>
              <button class="delete-btn del-emp" data-id="${emp.id}">🗑 Delete</button>
            </div>
          </div>
        `).join("") : `<p class="empty">No employees found.</p>` }
      </div>
    </div>
  `;

  // attach submit
  document.getElementById("addEmployeeForm").addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("newEmpEmail").value.trim();
    const password = document.getElementById("newEmpPassword").value.trim();
    if (!email) return alert("Email is required.");

    allUsers.push({ id: Date.now(), email, password, role: { id: 2, name: "Employee" } });
    localStorage.setItem("users", JSON.stringify(allUsers));
    renderEmployeeList();
  });

  // delete
  document.querySelectorAll(".del-emp").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (!confirm("Hapus employee ini?")) return;
      allUsers = allUsers.filter(u => u.id !== id);
      localStorage.setItem("users", JSON.stringify(allUsers));
      renderEmployeeList();
    });
  });

  // edit
  document.querySelectorAll(".edit-emp").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const user = allUsers.find(u => u.id === id);
      if (!user) return;
      const newEmail = prompt("New Email:", user.email);
      if (!newEmail) return;
      const newPassword = prompt("New Password:", user.password || "");
      if (!newPassword) return;
      user.email = newEmail;
      user.password = newPassword;
      localStorage.setItem("users", JSON.stringify(allUsers));
      renderEmployeeList();
    });
  });
}

// --- MANAGER TASK VIEW ---
function renderManagerTask() {
  pageTitle.textContent = "Manage Task";

  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
  const employees = allUsers.filter(u => u.role?.id === 2);

  tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  content.innerHTML = `
    <!-- Ini bagian Add Task yang baru -->
    <div class="pretty-card" style="padding:20px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); background-color:#fff;">
      <h3 class="card-title" style="margin-bottom:16px; font-size:18px; color:#1a73e8;">Add New Task</h3>
      <form id="taskForm" class="pretty-form" style="display:flex; flex-direction:column; gap:12px;">
        <input type="text" id="taskName" placeholder="Task title..." required
               style="padding:10px; border-radius:8px; border:1px solid #e6eefc; font-size:14px; width:100%; transition: border-color 0.2s;"
               onfocus="this.style.borderColor='#1a73e8'" onblur="this.style.borderColor='#e6eefc'" />
        
        <textarea id="taskDesc" placeholder="Task description..." required
                  style="padding:10px; border-radius:8px; border:1px solid #e6eefc; font-size:14px; width:100%; min-height:80px; resize:none; transition: border-color 0.2s;"
                  onfocus="this.style.borderColor='#1a73e8'" onblur="this.style.borderColor='#e6eefc'"></textarea>
        
        <input type="date" id="taskDeadline" required
               style="padding:10px; border-radius:8px; border:1px solid #e6eefc; font-size:14px; width:100%; transition: border-color 0.2s;"
               onfocus="this.style.borderColor='#1a73e8'" onblur="this.style.borderColor='#e6eefc'" />
        
        <select id="assignUser" required
                style="padding:10px; border-radius:8px; border:1px solid #e6eefc; font-size:14px; width:100%; transition: border-color 0.2s;"
                onfocus="this.style.borderColor='#1a73e8'" onblur="this.style.borderColor='#e6eefc'">
          <option value="">Assign to employee</option>
          ${ employees.map(emp => `<option value="${emp.email}">${emp.email}</option>`).join("") }
        </select>
        
        <button type="submit"
                style="padding:10px; border-radius:8px; border:none; background-color:#1a73e8; color:white; font-weight:bold; cursor:pointer; transition: background 0.2s;"
                onmouseover="this.style.backgroundColor='#1669c1'" onmouseout="this.style.backgroundColor='#1a73e8'">
          + Add Task
        </button>
      </form>
    </div>

  <div class="pretty-card" style="margin-top:16px;">
    <h3 class="card-title">Task List</h3>
    <div class="task-table-modern" style="border-collapse: collapse; width: 100%;">
      ${ tasks.length > 0 ? tasks.map(t => `
        <div class="task-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 8px; border-bottom: 1px solid #e0e0e0; transition: background 0.2s;">
          <div class="task-cell" style="flex: 3;">
            <strong>${escapeHtml(t.name)}</strong>
            <div style="color:var(--muted); font-size:13px; margin-top:4px;">${escapeHtml(t.description)}</div>
            <div style="font-size:12px; color:var(--muted); margin-top:6px;">Deadline: ${escapeHtml(t.deadline)}</div>
          </div>
          <div class="task-cell" style="flex: 2; text-align:center;">${escapeHtml(t.assigned)}</div>
          <div class="task-cell" style="flex: 1; text-align:center;">
            <span class="status-badge ${badgeClass(t.status)}">${escapeHtml(t.status)}</span>
          </div>
          <div class="task-cell" style="flex: 1; text-align:center;">
            <button class="add-btn edit-task" data-id="${t.id}" style="margin-right:4px;">✏️</button>
            <button class="delete-btn del-task" data-id="${t.id}">🗑</button>
          </div>
        </div>
      `).join("") : `<p class="empty" style="padding:12px; text-align:center;">No tasks yet.</p>` }
    </div>
  </div>
`;

// tambahkan hover effect
document.querySelectorAll(".task-row").forEach(row => {
  row.addEventListener("mouseenter", () => row.style.backgroundColor = "#f5f8ff");
  row.addEventListener("mouseleave", () => row.style.backgroundColor = "transparent");
});


  // add task
  document.getElementById("taskForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("taskName").value.trim();
    const assigned = document.getElementById("assignUser").value;
    const description = document.getElementById("taskDesc").value.trim();
    const deadline = document.getElementById("taskDeadline").value;
    if (!name || !assigned) return alert("Title and assignee required.");

    tasks.push({ id: Date.now(), name, assigned, description, deadline, status: "Pending" });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderManagerTask();
  });

  // delete task
  document.querySelectorAll(".del-task").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (!confirm("Delete this task?")) return;
      tasks = tasks.filter(t => t.id !== id);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderManagerTask();
    });
  });

  // edit task -> update status via prompt
  document.querySelectorAll(".edit-task").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const current = tasks.find(t => t.id === id);
      if (!current) return;
      const newStatus = prompt("Update Status (Pending | On Progress | Done):", current.status);
      if (!newStatus) return;
      current.status = newStatus;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderManagerTask();
    });
  });
}

// --- EMPLOYEE REPORTS ---
// --- EMPLOYEE REPORTS ---
function renderEmployeeReports() {
  pageTitle.textContent = "Employee Reports";

  const allTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  // ✅ Task yang DONE dari employee
  const reports = allTasks.filter(t =>
    (t.status === "Done" || t.status === "Completed") &&
    t.proofFileUrl
  );

  content.innerHTML = `
    ${reports.length === 0 
      ? "<p class='empty' style='padding:12px; text-align:center;'>No reports submitted yet.</p>" 
      : ""
    }

    <div class="report-container" style="display:flex; flex-wrap:wrap; gap:16px;">
      ${reports.map(r => `
        <div class="pretty-card" style="
          flex:1 1 280px;
          padding:20px;
          border-radius:12px;
          box-shadow:0 4px 12px rgba(0,0,0,0.08);
          background-color:#f9faff;
        ">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            <span style="font-size:20px;">📄</span>
            <h4 style="margin:0; font-size:16px; color:#1a73e8;">
              ${escapeHtml(r.name)}
            </h4>
          </div>

          <p><strong>Employee:</strong> ${escapeHtml(r.assigned)}</p>
          <p><strong>Deadline:</strong> ${escapeHtml(r.deadline)}</p>

          <p>
            <strong>Status:</strong>
            <span class="status-badge ${badgeClass(r.status)}"
              style="padding:4px 8px; border-radius:6px;">
              ${escapeHtml(r.status)}
            </span>
          </p>

          <a href="${r.proofFileUrl}" target="_blank"
            style="
              display:inline-flex;
              align-items:center;
              gap:6px;
              padding:10px 14px;
              border-radius:8px;
              background:#1a73e8;
              color:#fff;
              font-weight:bold;
              text-decoration:none;
            ">
            📎 Lihat Bukti
          </a>
        </div>
      `).join("")}
    </div>
  `;
}


// --- EMPLOYEE VIEW (for non-manager) ---
function renderEmployeeTask(){
  pageTitle.textContent = "My Task";
  tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const myTasks = tasks.filter(t => t.assigned === currentUser.email);

  if (myTasks.length === 0) {
    content.innerHTML = "<p class='empty'>No tasks assigned yet.</p>";
    return;
  }

  content.innerHTML = myTasks.map(t => `
    <div class="pretty-card" style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0">${escapeHtml(t.name)}</h3>
        <span class="status-badge ${badgeClass(t.status)}">${escapeHtml(t.status)}</span>
      </div>
      <p style="color:var(--muted);margin:6px 0">${escapeHtml(t.description)}</p>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <select class="task-status" data-id="${t.id}">
          <option value="Pending"${t.status==='Pending'?' selected':''}>Pending</option>
          <option value="On Progress"${t.status==='On Progress'?' selected':''}>On Progress</option>
          <option value="Done"${t.status==='Done'?' selected':''}>Done</option>
        </select>
        <button class="delete-btn" data-id="${t.id}">Delete</button>
      </div>
    </div>
  `).join("");

  // bind status change
  document.querySelectorAll(".task-status").forEach(sel => {
    sel.addEventListener("change", e => {
      const id = Number(e.target.dataset.id);
      const newStatus = e.target.value;
      tasks = tasks.map(t => t.id === id ? {...t, status: newStatus} : t);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderEmployeeTask();
    });
  });

  // delete
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = Number(btn.dataset.id);
      if (!confirm("Delete this task?")) return;
      tasks = tasks.filter(t => t.id !== id);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderEmployeeTask();
    });
  });
}

// --- helpers ---
function badgeClass(status){
  if (!status) return "badge-pending";
  const s = status.toLowerCase();
  if (s.includes("progress")) return "badge-progress";
  if (s.includes("done")) return "badge-done";
  return "badge-pending";
}
function escapeHtml(str){
  if (!str) return "";
  return String(str).replace(/[&<>"'`=\/]/g, function(s){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'})[s];
  });
}

// --- initial boot ---
document.addEventListener("DOMContentLoaded", () => {
  // build menu only for manager role (simple logic)
  if (currentUser.role.id === 1) {
    buildMenu();
    // set first item active
    const first = document.querySelector(".menu-item");
    if (first) first.classList.add("active");
    loadPage("dashboard");
  } else {
    // employee view
    menuList.innerHTML = `<div class="menu-item active" data-page="mytasks"><span class="mi-icon">📋</span><span class="mi-label">My Tasks</span></div>`;
    loadPage("employeeTask");
  }
});
