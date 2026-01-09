const todo = document.querySelector("#todo");
const progress = document.querySelector("#progress");
const done = document.querySelector("#done");

const columns = [todo, progress, done];

let dragElement = null;

/* ---------------- LOCAL STORAGE ---------------- */
function saveToLocalStorage() {
  const boardData = {
    todo: [],
    progress: [],
    done: [],
  };

  columns.forEach((col) => {
    const colId = col.id; // todo / progress / done
    col.querySelectorAll(".task").forEach((task) => {
      boardData[colId].push({
        title: task.querySelector("h2").innerText,
        desc: task.querySelector("p").innerText,
      });
    });
  });

  localStorage.setItem("kanbanBoard", JSON.stringify(boardData));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem("kanbanBoard"));
  if (!data) return;

  columns.forEach((col) => {
    col.querySelectorAll(".task").forEach((task) => task.remove());
  });

  Object.keys(data).forEach((colId) => {
    data[colId].forEach((task) => {
      createTask(task.title, task.desc, document.querySelector(`#${colId}`));
    });
  });

  updateCount();
}

/* ---------------- TASK COUNT ---------------- */
function updateCount() {
  columns.forEach((col) => {
    const count = col.querySelector(".right");
    if (count) {
      count.innerText = col.querySelectorAll(".task").length;
    }
  });
}

/* ---------------- DRAG TASK ---------------- */
function makeTaskDraggable(task) {
  task.setAttribute("draggable", "true");

  task.addEventListener("dragstart", () => {
    dragElement = task;
  });

  task.addEventListener("dragend", () => {
    dragElement = null;
    saveToLocalStorage();
  });
}

/* ---------------- COLUMN DRAG EVENTS ---------------- */
function addDragEventOnColumn(column) {
  column.addEventListener("dragover", (e) => e.preventDefault());

  column.addEventListener("drop", (e) => {
    e.preventDefault();
    if (dragElement) {
      column.appendChild(dragElement);
      updateCount();
      saveToLocalStorage();
    }
  });
}

columns.forEach(addDragEventOnColumn);

/* ---------------- CREATE TASK ---------------- */
function createTask(title, desc, column) {
  const div = document.createElement("div");
  div.classList.add("task");

  div.innerHTML = `
    <h2>${title}</h2>
    <p>${desc}</p>
    <button>Delete</button>
  `;

  makeTaskDraggable(div);

  div.querySelector("button").addEventListener("click", () => {
    div.remove();
    updateCount();
    saveToLocalStorage();
  });

  column.appendChild(div);
}

/* ---------------- EXISTING TASKS ---------------- */
document.querySelectorAll(".task").forEach((task) => {
  makeTaskDraggable(task);

  task.querySelector("button")?.addEventListener("click", () => {
    task.remove();
    updateCount();
    saveToLocalStorage();
  });
});

/* ---------------- MODAL LOGIC ---------------- */
const toggleModalButton = document.querySelector("#toggle-modal");
const bg = document.querySelector(".bg");
const modal = document.querySelector(".modal");
const addTaskButton = document.querySelector("#add-new-task");

toggleModalButton.addEventListener("click", () => {
  modal.classList.toggle("active");
});

bg.addEventListener("click", () => {
  modal.classList.remove("active");
});

/* ---------------- ADD NEW TASK ---------------- */
addTaskButton.addEventListener("click", () => {
  const taskTitle = document.querySelector("#task-titel-input").value;
  const desc = document.querySelector("#task-desc-input").value;

  if (!taskTitle) return;

  createTask(taskTitle, desc, todo);
  updateCount();
  saveToLocalStorage();

  modal.classList.remove("active");
  document.querySelector("#task-titel-input").value = "";
  document.querySelector("#task-desc-input").value = "";
});

/* ---------------- INIT ---------------- */
loadFromLocalStorage();
updateCount();
