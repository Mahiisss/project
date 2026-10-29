// ========== Helpers ==========
const $ = (selector) => document.querySelector(selector);

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable - ignore
  }
}

// ========== Footer year ==========
$("#year").textContent = new Date().getFullYear();

// ========== Mobile menu ==========
const menuBtn = $("#menuBtn");
const navLinks = $("#navLinks");

menuBtn.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", isOpen);
});

navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => navLinks.classList.remove("open"))
);

// ========== Dark mode ==========
const themeBtn = $("#themeBtn");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

applyTheme(load("theme", "light"));

themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  save("theme", next);
});

// ========== Tasks ==========
const taskForm = $("#taskForm");
const taskInput = $("#taskInput");
const taskList = $("#taskList");
const taskCount = $("#taskCount");
const clearDone = $("#clearDone");
const filterButtons = document.querySelectorAll(".filter");

let tasks = load("tasks", []);
let currentFilter = "all";

function renderTasks() {
  const visible = tasks.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  taskList.innerHTML = "";

  if (visible.length === 0) {
    taskList.innerHTML = `<li class="empty">No tasks here yet.</li>`;
  }

  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.textContent = task.text; // textContent prevents HTML injection

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.setAttribute("aria-label", "Delete task");
    del.textContent = "✕";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, text, del);
    taskList.appendChild(li);
  });

  const left = tasks.filter((t) => !t.done).length;
  taskCount.textContent = `${left} task${left === 1 ? "" : "s"} left`;
  save("tasks", tasks);
}

function addTask(text) {
  tasks.push({ id: Date.now(), text, done: false });
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  renderTasks();
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text);
  taskInput.value = "";
  taskInput.focus();
});

clearDone.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  renderTasks();
});

filterButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  })
);

renderTasks();

// ========== Contact form validation ==========
const contactForm = $("#contactForm");
const formSuccess = $("#formSuccess");

function setError(input, message) {
  const field = input.parentElement;
  field.classList.toggle("invalid", Boolean(message));
  field.querySelector(".error").textContent = message;
}

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#name");
  const email = $("#email");
  const message = $("#message");
  let valid = true;

  if (name.value.trim().length < 2) {
    setError(name, "Please enter your name.");
    valid = false;
  } else setError(name, "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    setError(email, "Please enter a valid email.");
    valid = false;
  } else setError(email, "");

  if (message.value.trim().length < 10) {
    setError(message, "Message should be at least 10 characters.");
    valid = false;
  } else setError(message, "");

  formSuccess.hidden = !valid;
  if (valid) contactForm.reset();
});
