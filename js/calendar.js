import { loadWorkData } from "./storage.js";
import { openModal } from "./modal.js";
import { calculateSalary } from "./salary.js";
import { updateMonthDisplay } from "./ui.js";

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar(year, month) {
  const workData = loadWorkData();
  const grid = document.getElementById("calendarGrid");

  let html = "";

  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="empty"></div>`;
  }

  for (let d = 1; d <= days; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d,
    ).padStart(2, "0")}`;

    const data = workData[date];

    let shiftText = "";
    let className = "";

    if (data && data.shift) {
      const shifts = Array.isArray(data.shift) ? data.shift : [data.shift];
      shiftText = shifts.join(", ");

      if (shifts.includes("Full")) className = "shift-full";
      else if (shifts.includes("Sáng")) className = "shift-sang";
      else if (shifts.includes("Chiều")) className = "shift-chieu";
      else if (shifts.includes("Tối")) className = "shift-toi";
    }

    html += `
<div class="day ${className}" data-date="${date}">
<div>${d}</div>
<small>${shiftText}</small>
</div>`;
  }

  grid.innerHTML = html;
  calculateSalary(year, month);
}

function changeMonth(direction) {
  currentMonth += direction;

  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  updateMonthDisplay(currentYear, currentMonth);
  renderCalendar(currentYear, currentMonth);
}

function nextMonth() {
  changeMonth(1);
}

function prevMonth() {
  changeMonth(-1);
}

function initCalendar() {
  const calendarGrid = document.getElementById("calendarGrid");
  calendarGrid.addEventListener("click", function (e) {
    const day = e.target.closest(".day");
    if (!day) return;
    const date = day.dataset.date;
    openModal(date);
  });

  renderCalendar(currentYear, currentMonth);
  updateMonthDisplay(currentYear, currentMonth);
  enableCalendarSwipe();
}

function handleSwipe(direction) {
    if (direction === "left") {
        nextMonth();
    } else if (direction === "right") {
        prevMonth();
    }
}

function initSlider() {
  const slider = document.getElementById("monthSlider");
  if (!slider) return;

  let startX = 0;
  const threshold = 50; // Minimum swipe distance

  slider.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", (e) => {
    const deltaX = e.changedTouches[0].clientX - startX;
    if (deltaX > threshold) {
      handleSwipe("right");
    } else if (deltaX < -threshold) {
      handleSwipe("left");
    }
  });

  slider.addEventListener("mousedown", (e) => {
    startX = e.clientX;
  });

  slider.addEventListener("mouseup", (e) => {
    const deltaX = e.clientX - startX;
    if (deltaX > threshold) {
      handleSwipe("right");
    } else if (deltaX < -threshold) {
      handleSwipe("left");
    }
  });
}

function enableCalendarSwipe() {
  const calendar = document.getElementById("calendarGrid");

  let startX = 0;
  let startY = 0;

  const threshold = 50;

  function start(e) {
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
  }

  function end(e) {
    const touch = e.changedTouches ? e.changedTouches[0] : e;

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (deltaX > threshold) {
      handleSwipe("right");
    } else if (deltaX < -threshold) {
      handleSwipe("left");
    }
  }

  calendar.addEventListener("touchstart", start);
  calendar.addEventListener("touchend", end);

  calendar.addEventListener("mousedown", start);
  calendar.addEventListener("mouseup", end);
}

export {
  renderCalendar,
  initCalendar,
  initSlider,
  nextMonth,
  prevMonth,
  currentYear,
  currentMonth,
};
