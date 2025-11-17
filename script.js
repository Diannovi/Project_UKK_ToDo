// Demo user database (you can replace with backend API later)
const users = [
  {
    id: 1,
    email: "manager@mail.com",
    password: "12345",
    role: { id: 1, name: "Manager" }
  },
  {
    id: 2,
    email: "employee@mail.com",
    password: "12345",
    role: { id: 2, name: "Employee" }
  }
];

const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Check user in demo database
  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(user));

    alert(`Welcome ${user.role.name}! Redirecting to your dashboard...`);
    if (user.role.id === 1) {
      window.location.href = "manager.html";
    } else if (user.role.id === 2) {
      window.location.href = "employe.html";
    }
  } else {
    alert("Email atau password salah!");
  }
});

// Optional: redirect if already logged in
window.addEventListener("DOMContentLoaded", () => {
  const existingUser = JSON.parse(localStorage.getItem("user"));
  if (existingUser) {
    if (existingUser.role.id === 1) {
      window.location.href = "manager.html";
    } else {
      window.location.href = "employe.html";
    }
  }
});
