const sidebar = document.getElementById("sidebar");
const menuList = document.getElementById("menuList");
const pageTitle = document.getElementById("pageTitle");
const content = document.getElementById("content");


const defaultTasks = [
  {
    id: 1,
    name: "Design Homepage",
    description: "Create a modern homepage design.",
    assigned: "employee@mail.com",
    status: "Pending",
    deadline: "2023-08-15"
  },
  {
    id: 2,
    name: "Update Website",
    description: "Update the website with new features.",
    assigned: "employee@mail.com",
    status: "Pending",
    deadline: "2023-08-20"
  },
  {
    id: 3,
    name: "Fix Bugs",
    description: "Resolve reported bugs from users.",
    assigned: "employee@mail.com",
    status: "On Progress",
    deadline: "2023-08-25"
  },
  {
    id: 4,
    name: "Write Documentation",
    description: "Document the new features added.",
    assigned: "employee@mail.com",
    status: "Done",
    deadline: "2023-08-30"
  },
  {
    id: 5,
    name: "Deploy to Production",
    description: "Deploy the application to production environment.",
    assigned: "employee@mail.com",
    status: "Pending",
    deadline: "2023-09-05"
  }
];

const currentUser = JSON.parse(localStorage.getItem("user"));
if (!currentUser) window.location.href = "index.html";

function setActiveMenu(page) {
  document.querySelectorAll(".menu-item").forEach(item => {
    item.classList.toggle("active", item.dataset.page === page);
  });
}

function loadPage(page) {
  document.getElementById("pageTitle").textContent = page;
  document.getElementById("content").innerHTML = `<h2>${page} Loaded</h2>`;
}


// === ROLE-BASED MENU ===
if (currentUser.role.id === 1) {
  // MANAGER MENU
  document.addEventListener("DOMContentLoaded", () => {

  const menus = [
    { name: "Dashboard", page: "dashboard" },
    { name: "Manage Employee", page: "manageEmployee" },
    { name: "Manage Task", page: "managerTask" }
  ];
  menus.forEach(m => {
  const div = document.createElement("div");
  div.className = "menu-item";
  div.dataset.page = m.page;
  div.textContent = m.name;
  menuList.appendChild(div);
});

  // GENERATE MENU
  menuList.innerHTML = menus
    .map(
      (m) => `
        <div class="menu-item" data-page="${m.page}">
          ${m.name}
        </div>
      `
    )
    .join("");

  // EVENT MENU CLICK
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      // ganti page title
      document.getElementById("pageTitle").textContent = item.textContent;

      // load halaman (kamu isi script-nya sendiri)
      loadPage(item.dataset.page);
    });
  });
});


// === SIDEBAR LINK CLICK HANDLER ===
const allLinks = menuList.querySelectorAll("a");
allLinks.forEach(link => {
  link.addEventListener("click", () => {
    allLinks.forEach(a => a.classList.remove("active"));
    link.classList.add("active");
    const page = link.getAttribute("data-page");
    loadPage(page);
  });
});

// === LOGOUT ===
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// === TASK STORAGE DATA ===
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
if (tasks.length === 0) {
  tasks = defaultTasks;
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// === PAGE LOADER ===
function loadPage(page) {
  if (currentUser.role.id === 1) {
    if (page === "dashboard") renderDashboard();
    else if (page === "manageEmployee") renderEmployeeList();
    else if (page === "managerTask") renderManagerTask(); // ini typo harusnya "managerTask" bukan manageTask
    // else if(page === "mangageTask") renderManageTask();
  } else {
    renderEmployeeTask();
  }
}

// === DASHBOARD MANAGER ===
// === DASHBOARD MANAGER ===
const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
console.log(allTasks);
function renderDashboard() {
  pageTitle.textContent = "Dashboard";

  // Ambil data users dan tasks
  const allUsers = JSON.parse(localStorage.getItem("users")) || [];
  console.log(allTasks);

  const employees = allUsers.filter(u => u.role.id === 2);

  const totalTasks = allTasks.length;
  const pending = allTasks.filter(t => t.status === "Pending").length;
  const progress = allTasks.filter(t => t.status === "On Progress").length;
  const completed = allTasks.filter(t => t.status === "Done").length;

  // Ambil 5 task terakhir
  
  const lastTasks = allTasks.slice(-5).reverse();

  // Render content
  content.innerHTML = `
    <!-- DASHBOARD CARDS -->
    <div class="dashboard-cards">
      <div class="dash-card">
        <h3>Total Employees</h3>
        <span class="count-blue">${employees.length}</span>
      </div>

      <div class="dash-card">
        <h3>Total Tasks</h3>
        <span class="count-orange">${totalTasks}</span>
      </div>

      <div class="dash-card">
        <h3>Completed Tasks</h3>
        <span class="count-green">${completed}</span>
      </div>
    </div>

  <!-- TASK OVERVIEW -->
<div class="task-overview">
  <h3>Task Overview</h3>
  <div class="task-overview-row">
    <div class="tov-item">
      <div class="tov-title">Pending</div>
      <div class="tov-number tov-orange">${pending}</div>
    </div>
    <div class="tov-item">
      <div class="tov-title">On Progress</div>
      <div class="tov-number tov-blue">${progress}</div>
    </div>
    <div class="tov-item">
      <div class="tov-title">Done</div>
      <div class="tov-number tov-green">${completed}</div>
    </div>
  </div>
</div>


    <!-- RECENT TASK TABLE -->
   <div class="recent-task-table">
  <h3>Recent Tasks</h3>
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Assigned</th>
          <th>Deadline</th>
        <th>Status</th>
             
      </tr>
    </thead>
    <tbody id="recentBody">
    </tbody>
  </table>
</div>
  `;

  // Render 5 task terakhir
  const recentBody = document.getElementById("recentBody");
 recentBody.innerHTML = lastTasks
  .map(
    t => `
      <tr>
        <td>
          <strong>${t.name}</strong><br>
        </td>
        <td>${t.assigned}</td>
          <td>${t.deadline}</td>
        <td>
          <span class="status-badge ${
            t.status === "Pending"
              ? "badge-pending"
              : t.status === "On Progress"
              ? "badge-progress"
              : "badge-done"
          }">${t.status}</span>
        </td>

      </tr>
    `
  )
  .join("");
}




// === EMPLOYEE MANAGEMENT ===
function renderEmployeeList() {
  pageTitle.textContent = "Manage Employee";

  let allUsers = JSON.parse(localStorage.getItem("users")) || [];
  let employees = allUsers.filter(u => u.role.id === 2);

  content.innerHTML = `
    <div class="card pretty-card">
      <h3 class="card-title">Add New Employee</h3>

      <form id="addEmployeeForm" class="pretty-form">
        <input type="email" id="newEmpEmail" placeholder="Employee email..." required />
        <input type="text" id="newEmpPassword" placeholder="Default password..." value="12345" required />

        <button class="add-btn" type="submit">+ Add Employee</button>
      </form>
    </div>

    <div class="card pretty-card" style="margin-top:20px;">
      <h3 class="card-title">📋 Employee List</h3>

      <div class="task-table-modern">
        ${
          employees.length > 0
            ? employees
                .map(
                  emp => `
          <div class="task-row">
            <div class="task-cell">${emp.email}</div>

            <div class="task-cell">
              <span class="badge role-badge">Employee</span>
            </div>

            <div class="task-cell">${emp.password || "12345"}</div>

            <div class="task-cell action-cell">
              <button class="status-btn edit-emp" data-id="${emp.id}">✏️</button>
              <button class="delete-btn del-emp" data-id="${emp.id}">🗑</button>
            </div>
          </div>
        `
                )
                .join("")
            : `<p class="empty">No employees found.</p>`
        }
      </div>
    </div>
  `;

  // === ADD EMPLOYEE ===
  document.getElementById("addEmployeeForm").addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("newEmpEmail").value;
    const password = document.getElementById("newEmpPassword").value;

    allUsers.push({
      id: Date.now(),
      email,
      password,
      role: { id: 2, name: "Employee" }
    });

    localStorage.setItem("users", JSON.stringify(allUsers));

    renderEmployeeList();
  });

  // === DELETE EMPLOYEE ===
  document.querySelectorAll(".del-emp").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      allUsers = allUsers.filter(u => u.id != id);
      localStorage.setItem("users", JSON.stringify(allUsers));

      renderEmployeeList();
    });
  });

  // === EDIT EMPLOYEE (PROMPT) ===
  document.querySelectorAll(".edit-emp").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      let user = allUsers.find(u => u.id == id);

      const newEmail = prompt("New Email:", user.email);
      if (!newEmail) return;

      const newPassword = prompt("New Password:", user.password);
      if (!newPassword) return;

      user.email = newEmail;
      user.password = newPassword;

      localStorage.setItem("users", JSON.stringify(allUsers));

      renderEmployeeList();
    });
  });
}


  // // Add Employee Logic
  // document.getElementById("addEmployeeForm").addEventListener("submit", e => {
  //   e.preventDefault();

  //   const email = document.getElementById("newEmpEmail").value;
  //   const pwd = document.getElementById("newEmpPassword").value;

  //   allUsers.push({
  //     id: Date.now(),
  //     email,
  //     password: pwd,
  //     role: { id: 2, name: "Employee" }
  //   });

  //   localStorage.setItem("users", JSON.stringify(allUsers));

  //   renderEmployeeList();
  // });

  // // Delete Action
  // document.querySelectorAll(".delete-btn").forEach(btn => {
  //   btn.addEventListener("click", e => {
  //     const id = e.target.getAttribute("data-id");
  //     allUsers = allUsers.filter(u => u.id != id);
  //     localStorage.setItem("users", JSON.stringify(allUsers));
  //     renderEmployeeList();
  //   });
  // });

  // // Edit Action
  // document.querySelectorAll(".edit-btn").forEach(btn => {
  //   btn.addEventListener("click", e => {
  //     const id = e.target.getAttribute("data-id");
  //     const target = allUsers.find(u => u.id == id);

  //     const newEmail = prompt("Edit Email:", target.email);
  //     const newPass = prompt("Edit Password:", target.password);

  //     if (newEmail) target.email = newEmail;
  //     if (newPass) target.password = newPass;

  //     localStorage.setItem("users", JSON.stringify(allUsers));
  //     renderEmployeeList();
  //   });
  // });



// === MANAGER TASK VIEW ===
  function renderManagerTask() {
  pageTitle.textContent = "Manager Task";

  let allUsers = JSON.parse(localStorage.getItem("users")) || [];
  let employees = allUsers.filter(u => u.role.id === 2);

  content.innerHTML = `
    <div class="card pretty-card">
      <h3 class="card-title">Add New Task</h3>

      <form id="taskForm" class="pretty-form">
  <input type="text" id="taskName" placeholder="Task title..." required />

  <textarea id="taskDesc" placeholder="Task description..." required></textarea>

  <input type="date" id="taskDeadline" required />

  <select id="assignUser" required>
    <option value="">Assign to employee</option>
    ${employees.map(emp => `<option value="${emp.email}">${emp.email}</option>`).join("")}
  </select>

  <button class="add-btn" type="submit">+ Add Task</button>
</form>

    </div>

    <div class="card pretty-card" style="margin-top:20px;">
      <h3 class="card-title">📋 Task List</h3>

      <div class="task-table-modern">
  ${
    tasks.length > 0
      ? tasks
          .map(
            t => `
      <div class="task-row">
        <div class="task-cell">
          <strong>${t.name}</strong><br>
          <small>${t.description}</small><br>
          <small>Deadline: ${t.deadline}</small>
        </div>

        <div class="task-cell">${t.assigned}</div>

        <div class="task-cell">
          <span class="badge ${t.status.toLowerCase().replace(" ", "-")}">
            ${t.status}
          </span>
        </div>

        <div class="task-cell action-cell">
          <button class="status-btn" data-id="${t.id}">✏️</button>
          <button class="delete-btn" data-id="${t.id}">🗑</button>
        </div>
      </div>
    `
          )
          .join("")
      : `<p class="empty">No tasks yet.</p>`
  }
</div>
`;

 // === ADD TASK ===
document.getElementById("taskForm").addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("taskName").value;
  const assigned = document.getElementById("assignUser").value;
  const description = document.getElementById("taskDesc").value;
  const deadline = document.getElementById("taskDeadline").value;

  tasks.push({
    id: Date.now(),
    name,
    assigned,
    description,
    deadline,
    status: "Pending",
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderManagerTask();
});


  // === DELETE TASK ===
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      tasks = tasks.filter(t => t.id != id);
      localStorage.setItem("tasks", JSON.stringify(tasks));

      renderManagerTask();
    });
  });

  // === EDIT TASK (Modal Popup) ===
  document.querySelectorAll(".status-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      const newStatus = prompt(
        "Update Status:\n- Pending\n- On Progress\n- Done"
      );

      if (!newStatus) return;

      tasks = tasks.map(t =>
        t.id == id ? { ...t, status: newStatus } : t
      );

      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderManagerTask();
    });
  });
}

  // // === ADD TASK ===
  // document.getElementById("taskForm").addEventListener("submit", e => {
  //   e.preventDefault();

  //   const name = document.getElementById("taskName").value;
  //   const assigned = document.getElementById("assignUser").value;

  //   tasks.push({
  //     id: Date.now(),
  //     name,
  //     assigned,
  //     status: "Pending"
  //   });

  //   localStorage.setItem("tasks", JSON.stringify(tasks));
  //   renderManagerTask();
  // });

  // // === DELETE TASK ===
  // document.querySelectorAll(".delete-btn").forEach(btn => {
  //   btn.addEventListener("click", () => {
  //     const id = btn.dataset.id;

  //     tasks = tasks.filter(t => t.id != id);
  //     localStorage.setItem("tasks", JSON.stringify(tasks));

  //     renderManagerTask();
  //   });
  // });

  // // === EDIT TASK (STATUS ONLY) ===
  // document.querySelectorAll(".edit-btn").forEach(btn => {
  //   btn.addEventListener("click", () => {
  //     const id = btn.dataset.id;

  //     const newStatus = prompt("Update Status: Pending | On Progress | Done");
  //     if (!newStatus) return;

  //     tasks = tasks.map(t =>
  //       t.id == id ? { ...t, status: newStatus } : t
  //     );

  //     localStorage.setItem("tasks", JSON.stringify(tasks));
  //     renderManagerTask();
  //   });
  // });




// === EMPLOYEE TASK VIEW ===
function renderEmployeeTask() {
  pageTitle.textContent = "My Task";

  const myTasks = tasks.filter(t => t.assigned === currentUser.email);

  content.innerHTML = `
    <h3>My Tasks</h3>
    ${myTasks.length === 0 ? "<p>No tasks assigned yet.</p>" : ""}
    ${myTasks
      .map(
        t => `
      <div class="task-item">
        <span>${t.name}</span>
        <select class="task-status" data-id="${t.id}">
          <option ${t.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${t.status === "On Progress" ? "selected" : ""}>On Progress</option>
          <option ${t.status === "Done" ? "selected" : ""}>Done</option>
        </select>
      </div>
    `
      )
      .join("")}
  `;

  document.querySelectorAll(".task-status").forEach(sel => {
    sel.addEventListener("change", e => {
      const id = e.target.getAttribute("data-id");
      const newStatus = e.target.value;

      tasks = tasks.map(t => (t.id == id ? { ...t, status: newStatus } : t));
      localStorage.setItem("tasks", JSON.stringify(tasks));
    });
  });
}

// === HELPER: Employee email list ===
function usersOptionList() {
  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
  const employees = allUsers.filter(u => u.role?.id === 2);
  return employees.map(u => `<option value="${u.email}">${u.email}</option>`).join("");
}

// === HELPER: Task list render ===
function renderTaskList() {
  if (tasks.length === 0) return "<p>No tasks yet.</p>";

  return tasks
    .map(
      t => `
      <div class="task-item">
        <span>${t.name} — <small>${t.assigned}</small></span>
        <span class="status">${t.status}</span>
      </div>
    `
    )
    .join("");
}

// === DEFAULT USERS (ONLY IF NOT EXIST) ===
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify([
    { id: 1, email: "manager@mail.com", role: { id: 1, name: "Manager" } },
    { id: 2, email: "employee@mail.com", role: { id: 2, name: "Employee" } }
  ]));
}

// === INITIAL LOAD ===
if (currentUser.role.id === 1) loadPage("dashboard");
else loadPage("employeeTask");}
// Initial load
document.addEventListener("DOMContentLoaded", () => {
  if (currentUser.role.id === 1) {
    loadPage("dashboard");       // render dashboard
    setActiveMenu("dashboard");  // tandai menu dashboard aktif
  } else {
    loadPage("employeeTask");    
    setActiveMenu("employeeTask");
  }
});
