let saveTimer = null;

function saveData() {
  clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    localStorage.setItem("workData_v6", JSON.stringify(workData));
  }, 300);
}

function safeParse(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

let workData = safeParse("workData_v6") || safeParse("workData_v5") || {};
let currentUser = localStorage.getItem("loggedUser") || null;
let selectedDateKey = null;

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwVf6cTbWCLxyIwXVdR9GIXgsQC_lndTR0iutKyiSxvglR8YDljwmqC6X4wiWCIYXu_Xw/exec";



let newData = {};
for (let k in workData) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
    // Nếu đã đúng format thì giữ nguyên
    newData[k] = workData[k];
  } else {
    // Nếu là format cũ thì mới convert
    const parts = k.split("/");
    if (parts.length === 3) {
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      const y = parts[2];
      newData[`${y}-${m}-${d}`] = workData[k];
    }
  }
}
workData = newData;

window.onload = () => {
  if (currentUser) showApp(currentUser);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateCountdown();
  });
};

function saveBranch() {
  saveData();
  localStorage.setItem(
    "selectedBranch",
    document.getElementById("branchSelect").value,
  );
  updateCountdown();
}

// --- QUẢN LÝ TÀI KHOẢN ---
function toggleForm() {
  document.getElementById("login-form").classList.toggle("hidden");
  document.getElementById("register-form").classList.toggle("hidden");
}

function register() {
  const u = document.getElementById("reg-user").value.trim();
  const p = document.getElementById("reg-pass").value.trim();

  fetch(SCRIPT_URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "register",
      username: u,
      password: p,
    }),
  })
    .then((res) => res.text())
    .then((data) => {
      if (data === "USER_EXISTS") {
        alert("Tài khoản đã tồn tại!");
      } else {
        alert("Đăng ký thành công!");
        toggleForm();
      }
    });
}

function login() {
  const u = document.getElementById("login-user").value.trim();
  const p = document.getElementById("login-pass").value.trim();

  fetch(SCRIPT_URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "login",
      username: u,
      password: p,
    }),
  })
    .then((res) => res.text())
    .then((data) => {
      console.log("Server trả về:", data);

      if (data === "LOGIN_FAILED") {
        alert("Sai tài khoản hoặc mật khẩu!");
      } else {
        localStorage.setItem("loggedUser", u);
        workData = JSON.parse(data);
        localStorage.setItem("workData_v6", data);
        showApp(u);
      }
    });
}

function showApp(user) {
  document.getElementById("auth-card").classList.add("hidden");
  document.getElementById("main-app").classList.remove("hidden");
  document.getElementById("hello-user").innerText = `Chào ${user}! 🌸`;

  initSlider(); // set tháng năm trước
  updateMonthDisplay();
  initCalendar(); // render sau cùng
  enableCalendarSwipe(); // Bật tính năng vuốt trên lịch
}

function logout() {
  localStorage.removeItem("loggedUser");
  location.reload();
}

// --- LOGIC LỊCH & DỰ BÁO NGÀY DÂU ---
function initCalendar() {
  const calendarGrid = document.getElementById("calendarGrid");
  calendarGrid.addEventListener("click", function (e) {
    if (!e.target.classList.contains("day")) return;
    const date = e.target.dataset.date;
    openModal(date);
  });

  renderCalendar(currentYear, currentMonth);
}

function renderCalendar(year, month) {
  const calendarGrid = document.getElementById("calendarGrid");
  let html = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="empty"></div>`;
  }

  // Add cells for each day of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    html += `
      <div class="day" data-date="${date}">
        ${d}
      </div>
    `;
  }

  calendarGrid.innerHTML = html;
}

let selectedShifts = [];

function toggleShift(e, shift) {
  const btn = e.target;

  if (shift === "Full") {
    selectedShifts = ["Full"];
    document.querySelectorAll(".btn-group button").forEach((b) => {
      b.classList.remove("active-shift");
    });
    btn.classList.add("active-shift");
    return;
  }

  if (selectedShifts.includes("Full")) {
    selectedShifts = [];
    document.querySelector(".btn-full").classList.remove("active-shift");
  }

  if (selectedShifts.includes(shift)) {
    selectedShifts = selectedShifts.filter((s) => s !== shift);
    btn.classList.remove("active-shift");
  } else {
    selectedShifts.push(shift);
    btn.classList.add("active-shift");
  }
}

// --- ĐẾM NGƯỢC ---
function updateCountdown() {
  const now = new Date();
  const todayKey = formatDateLocal(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  const todayData = workData[todayKey];
  const el = document.getElementById("countdown-timer");

  if (!todayData || !todayData.shift || todayData.shift.length === 0) {
    el.innerText = "Hôm nay bé nghỉ, đi chơi thôi! ❤️";
    return;
  }

  const branch = selectedBranch;
  const shifts = Array.isArray(todayData.shift)
    ? todayData.shift
    : [todayData.shift];

  let nextShift = null;

  for (let shift of shifts) {
    let startH = 0,
      startM = 0,
      endH = 0,
      endM = 0;

    if (shift === "Sáng") {
      if (branch === "503" || branch === "257") {
        startH = 9;
        startM = 0;
        endH = 13;
        endM = 0;
      } else {
        startH = 9;
        startM = 30;
        endH = 13;
        endM = 30;
      }
    }

    if (shift === "Chiều") {
      if (branch === "503" || branch === "257") {
        startH = 13;
        startM = 0;
        endH = 17;
        endM = 0;
      } else {
        startH = 13;
        startM = 30;
        endH = 17;
        endM = 30;
      }
    }

    if (shift === "Tối") {
      if (branch === "503" || branch === "257") {
        startH = 17;
        startM = 0;
        endH = 22;
        endM = 0;
      } else {
        startH = 17;
        startM = 30;
        endH = 22;
        endM = 30;
      }
    }

    const start = new Date();
    start.setHours(startH, startM, 0);

    const end = new Date();
    end.setHours(endH, endM, 0);

    if (now < end) {
      nextShift = { shift, start, end, startH, startM, endH, endM };
      break;
    }
  }

  if (!nextShift) {
    el.innerText = "Hôm nay xong việc rồi, nghỉ thôi! 🛵";
    return;
  }

  const { shift, start, end, startH, startM, endH, endM } = nextShift;

  if (now < start) {
    const diff = start - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);

    el.innerText =
      `Ca ${shift} (${startH}:${String(startM).padStart(2, "0")} - ${endH}:${String(endM).padStart(2, "0")})\n` +
      `Còn ${h}h ${m}p nữa vào ca 💼`;
  } else {
    const diff = end - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);

    el.innerText =
      `Ca ${shift} (${startH}:${String(startM).padStart(2, "0")} - ${endH}:${String(endM).padStart(2, "0")})\n` +
      `Còn ${h}h ${m}p nữa tan ca 🥰`;
  }
}

// --- MODAL & CHỨC NĂNG ---
function openModal(key) {
  selectedDateKey = key;
  const data = workData[key] || { shift: null, isPeriod: false, note: "" };

  selectedShifts = Array.isArray(data.shift)
    ? data.shift
    : data.shift
      ? [data.shift]
      : [];

  const [y, m, d] = key.split("-");
  document.getElementById("modalDate").innerText = `Ngày ${d}/${m}/${y}`;
  document.getElementById("dayNote").value = data.note || "";

  const periodBtn = document.querySelector(".btn-period");
  periodBtn.innerText = data.isPeriod ? "Xóa Ngày Dâu 🧊" : "Ngày Dâu 🩸";

  // reset nút ca
  document.querySelectorAll(".btn-group button").forEach((btn) => {
    btn.classList.remove("active-shift");
  });

  // bật lại ca đã chọn
  selectedShifts.forEach((shift) => {
    const btn = document.querySelector(`[data-shift="${shift}"]`);
    if (btn) btn.classList.add("active-shift");
  });

  document.getElementById("modal").style.display = "flex";
}

function setShift(e, s) {
  if (!workData[selectedDateKey])
    workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };

  workData[selectedDateKey].shift = selectedShifts;

  document
    .querySelectorAll(".btn-group button")
    .forEach((btn) => (btn.style.border = "none"));

  if (e) e.target.style.border = "2px solid #ff4d6d";
}

function togglePeriod() {
  if (!workData[selectedDateKey])
    workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };
  workData[selectedDateKey].isPeriod = !workData[selectedDateKey].isPeriod;

  // Đổi chữ trên nút để bé biết đã bật hay chưa
  const periodBtn = document.querySelector(".btn-period");
  periodBtn.innerText = workData[selectedDateKey].isPeriod
    ? "Xóa Ngày Dâu 🧊"
    : "Ngày Dâu 🩸";
}

// --- ĐỒNG BỘ GOOGLE SHEETS ---
// --- ĐỒNG BỘ GOOGLE SHEETS (Bản Fix 5 Cột) ---
function saveAndRefresh() {
  if (!selectedDateKey) return;

  // Bước quan trọng: Lấy nội dung ghi chú từ ô Textarea TRƯỚC khi đóng
  const noteContent = document.getElementById("dayNote").value;

  if (!workData[selectedDateKey])
    workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };
  workData[selectedDateKey].shift = selectedShifts;
  workData[selectedDateKey].note = noteContent;
  workData[selectedDateKey].branch = selectedBranch;

  // 1. Lưu LocalStorage
  localStorage.setItem("workData_v6", JSON.stringify(workData));

  // 2. Gửi sang Sheets
  const data = workData[selectedDateKey];
  if (data) {
    const params = new URLSearchParams();
    params.append("ngay", selectedDateKey);
    params.append(
      "taiKhoan",
      localStorage.getItem("loggedUser") || "Công Chúa",
    );

    const loaiHienThi = data.isPeriod
      ? `${data.shift || "Nghỉ"} + Dâu 🩸`
      : data.shift || "Nghỉ";
    params.append("caLam", loaiHienThi);
    params.append("chiNhanh", selectedBranch);
    params.append("ghiChu", data.note || "");

    fetch(SCRIPT_URL, {
      method: "POST",
      body: new URLSearchParams({
        action: "saveData",
        username: localStorage.getItem("loggedUser"),
        data: JSON.stringify(workData),
        ngay: selectedDateKey,
        ca: data.shift || "Nghỉ",
        ghiChu: data.note || "",
        chiNhanh: selectedBranch,
      }),
    });
  }

  // 3. Cập nhật giao diện và ĐÓNG MODAL
  renderCalendar(currentYear, currentMonth);
  closeModal();
  updateCountdown();
  calculateSalary();
}

// Sửa lại hàm saveNote để nó cũng gọi chung 1 hàm lưu
function saveNote() {
  saveAndRefresh();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function calculateSalary() {
  let hrs = 0;
  let m = currentMonth + 1,
    y = currentYear;

  for (let k in workData) {
    const monthStr = String(m).padStart(2, "0");

    if (k.startsWith(`${y}-${monthStr}-`)) {
      const s = workData[k].shift;

      if (Array.isArray(s)) {
        s.forEach((shift) => {
          if (shift === "Sáng") hrs += 4;
          if (shift === "Chiều") hrs += 4;
          if (shift === "Tối") hrs += 5;
          if (shift === "Full") hrs += 13;
        });
      } else if (s === "Full") {
        hrs += 13;
      }
    }
  }

  const rate = parseInt(document.getElementById("hourlyRateInput").value) || 0;

  document.getElementById("totalMoney").innerText =
    (hrs * rate).toLocaleString() + "đ";
}

function copyReport() {
  let m = currentMonth + 1;
  let txt = `📊 BÁO CÁO LƯƠNG THÁNG ${m}\n----------------\n- Ca Full: ${document.getElementById("totalFull").innerText}\n- Ca Nửa: ${document.getElementById("totalHalf").innerText}\n- Tổng nhận: ${document.getElementById("totalMoney").innerText}\n\nBé làm vất vả rồi, yêu Anh! ❤️`;
  navigator.clipboard.writeText(txt);
  alert("Đã copy báo cáo!");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("Offline mode sẵn sàng!", reg))
      .catch((err) => console.log("Lỗi offline:", err));
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then((reg) => {
    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // Hiện một cái thông báo nhẹ
          alert(
            "Đã có bản cập nhật mới! Bé tắt App mở lại để thấy thay đổi nhé ❤️",
          );
        }
      });
    });
  });
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function updateMonthDisplay() {
  document.getElementById("monthDisplay").innerText =
    `Tháng ${currentMonth + 1} - ${currentYear}`;
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

  updateMonthDisplay();
  renderCalendar(currentYear, currentMonth);
}

function nextMonth() {
  changeMonth(1);
}

function prevMonth() {
  changeMonth(-1);
}

function initSlider() {
  slider = document.getElementById("monthSlider");
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

function handleSwipe(direction) {
  if (direction === "left") {
    nextMonth();
  } else if (direction === "right") {
    prevMonth();
  }
}

let selectedBranch = localStorage.getItem("selectedBranch") || "176";

document.querySelectorAll(".branch-card").forEach((card) => {
  if (card.dataset.branch === selectedBranch) card.classList.add("active");

  card.addEventListener("click", () => {
    selectedBranch = card.dataset.branch;
    localStorage.setItem("selectedBranch", selectedBranch);

    document
      .querySelectorAll(".branch-card")
      .forEach((c) => c.classList.remove("active"));

    card.classList.add("active");
    updateCountdown();
  });
});

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

    // bỏ qua nếu scroll dọc
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
