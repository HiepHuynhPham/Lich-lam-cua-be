let workData = JSON.parse(localStorage.getItem('workData_v6')) || JSON.parse(localStorage.getItem('workData_v5')) || {};
let currentUser = localStorage.getItem('loggedUser') || null;
let selectedDateKey = null;

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwVf6cTbWCLxyIwXVdR9GIXgsQC_lndTR0iutKyiSxvglR8YDljwmqC6X4wiWCIYXu_Xw/exec";


window.onload = () => {
    if (currentUser) showApp(currentUser);
    setInterval(updateCountdown, 1000);
};

function saveBranch() {
    localStorage.setItem('selectedBranch', document.getElementById('branchSelect').value);
    updateCountdown();
}

// --- QUẢN LÝ TÀI KHOẢN ---
function toggleForm() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

function register() {
    const u = document.getElementById('reg-user').value.trim();
    const p = document.getElementById('reg-pass').value.trim();

    fetch(SCRIPT_URL, {
        method: "POST",
        body: new URLSearchParams({
            action: "register",
            username: u,
            password: p
        })
    })
    .then(res => res.text())
    .then(data => {
        if (data === "USER_EXISTS") {
            alert("Tài khoản đã tồn tại!");
        } else {
            alert("Đăng ký thành công!");
            toggleForm();
        }
    });
}

function login() {
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value.trim();

    fetch(SCRIPT_URL, {
        method: "POST",
        body: new URLSearchParams({
            action: "login",
            username: u,
            password: p
        })
    })
    .then(res => res.text())
    .then(data => {
        console.log("Server trả về:", data);  // 👈 THÊM DÒNG NÀY

        if (data === "LOGIN_FAILED") {
            alert("Sai tài khoản hoặc mật khẩu!");
        } else {
            localStorage.setItem('loggedUser', u);
            workData = JSON.parse(data);
            localStorage.setItem('workData_v6', data);
            showApp(u);
        }
    });
}

function showApp(user) {
    document.getElementById('auth-card').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('hello-user').innerText = `Chào ${user}! 🌸`;

    initSlider();          // set tháng năm trước
    updateMonthDisplay();  
    initCalendar();        // render sau cùng
    enableCalendarSwipe(); // Bật tính năng vuốt trên lịch
}

function logout() { localStorage.removeItem('loggedUser'); location.reload(); }

// --- LOGIC LỊCH & DỰ BÁO NGÀY DÂU ---
function initCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const month = currentMonth;
    const year = currentYear;
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let lastPeriod = null;
    Object.keys(workData).sort().forEach(k => { if(workData[k].isPeriod) lastPeriod = new Date(k); });

    ['CN','T2','T3','T4','T5','T6','T7'].forEach(d => grid.innerHTML += `<div class="day-name">${d}</div>`);
    for (let i = 0; i < (firstDay||7)-7; i++) grid.innerHTML += `<div></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${month + 1}-${d}`;
        const data = workData[key] || { shift: null, isPeriod: false, note: "" };
        let cls = data.shift === 'Full' ? 'selected-full' : (data.shift ? 'selected-half' : '');
        if (data.isPeriod) cls += ' is-period';
        if (data.note) cls += ' has-note';

        if (lastPeriod && !data.isPeriod) {
            let current = new Date(key);
            let nextPredict = new Date(lastPeriod);
            nextPredict.setDate(nextPredict.getDate() + 28 - 5);
            if (current.toDateString() === nextPredict.toDateString()) cls += ' predicted-period';
        }

        grid.innerHTML += `<div class="day ${cls}" onclick="openModal('${key}')">${d}<small style="font-size:7px">${data.shift||''}</small></div>`;
    }
    calculateSalary();
}

// --- ĐẾM NGƯỢC ---
function updateCountdown() {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const todayData = workData[todayKey];
    const branch = selectedBranch;
    const el = document.getElementById('countdown-timer');

    if (!todayData || !todayData.shift) {
        el.innerText = "Hôm nay bé nghỉ, đi chơi thôi! ❤️";
        return;
    }

    let endH = 22, endM = 0;
    if (branch === "176") { endH = 22; endM = 30; }
    else if (branch === "503") { endH = 22; endM = 0; }
    else if (branch === "CN3") { endH = 21; endM = 30; }
    else if (branch === "CN4") { endH = 21; endM = 0; }

    if (todayData.shift === "Sáng") { endH = 14; endM = 0; }

    const target = new Date();
    target.setHours(endH, endM, 0);

    const diff = target - now;
    if (diff > 0) {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        el.innerText = `Còn ${h}h ${m}p nữa là được gặp Anh rồi! 🥰`;
    } else {
        el.innerText = "Bé xong việc rồi, về với Anh nào! 🛵";
    }
}

// --- MODAL & CHỨC NĂNG ---
function openModal(key) {
    selectedDateKey = key;
    const data = workData[key] || { isPeriod: false, note: "" };
    document.getElementById('modalDate').innerText = "Ngày " + key.split('-')[2];
    document.getElementById('dayNote').value = data.note || "";
    const periodBtn = document.querySelector('.btn-period');
    periodBtn.innerText = data.isPeriod ? "Xóa Ngày Dâu 🧊" : "Ngày Dâu 🩸";
    document.getElementById('modal').style.display = 'flex';
}

function setShift(s) {
    if(!workData[selectedDateKey]) workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };
    workData[selectedDateKey].shift = s;
    
    // Thêm hiệu ứng để bé biết là đã bấm trúng (Nút sẽ đậm lên)
    document.querySelectorAll('.btn-group button').forEach(btn => btn.style.border = "none");
    if(event) event.target.style.border = "2px solid #ff85a1";
    
    // CHỈ CẬP NHẬT DỮ LIỆU TẠM THỜI, KHÔNG GỌI saveAndRefresh() Ở ĐÂY
    console.log("Đã chọn ca: " + s);
}

function togglePeriod() {
    if(!workData[selectedDateKey]) workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };
    workData[selectedDateKey].isPeriod = !workData[selectedDateKey].isPeriod;
    
    // Đổi chữ trên nút để bé biết đã bật hay chưa
    const periodBtn = document.querySelector('.btn-period');
    periodBtn.innerText = workData[selectedDateKey].isPeriod ? "Xóa Ngày Dâu 🧊" : "Ngày Dâu 🩸";
}

// --- ĐỒNG BỘ GOOGLE SHEETS ---
// --- ĐỒNG BỘ GOOGLE SHEETS (Bản Fix 5 Cột) ---
function saveAndRefresh() {
    if(!selectedDateKey) return;

    // Bước quan trọng: Lấy nội dung ghi chú từ ô Textarea TRƯỚC khi đóng
    const noteContent = document.getElementById('dayNote').value;
    
    if(!workData[selectedDateKey]) workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };
    workData[selectedDateKey].note = noteContent;

    // 1. Lưu LocalStorage
    localStorage.setItem('workData_v6', JSON.stringify(workData));

    // 2. Gửi sang Sheets
    const data = workData[selectedDateKey];
    if (data) {
        const params = new URLSearchParams();
        params.append('ngay', selectedDateKey);
        params.append('taiKhoan', localStorage.getItem('loggedUser') || "Công Chúa");
        
        const loaiHienThi = data.isPeriod ? `${data.shift || 'Nghỉ'} + Dâu 🩸` : (data.shift || 'Nghỉ');
        params.append('caLam', loaiHienThi);
        params.append('chiNhanh', selectedBranch);
        params.append('ghiChu', data.note || "");

        fetch(SCRIPT_URL, {
    method: "POST",
    body: new URLSearchParams({
        action: "saveData",
        username: localStorage.getItem('loggedUser'),
        data: JSON.stringify(workData)
    })
});
    }

    // 3. Cập nhật giao diện và ĐÓNG MODAL
    renderCalendar();
    closeModal(); 
    updateCountdown();
    calculateSalary();
}

// Sửa lại hàm saveNote để nó cũng gọi chung 1 hàm lưu
function saveNote() {
    saveAndRefresh();
}

function closeModal() { 
    document.getElementById('modal').style.display = 'none'; 
}

function calculateSalary() {
    let full = 0, half = 0, hrs = 0, 
        m = currentMonth + 1,
        y = currentYear;
    
    for (let k in workData) {
        if (k.startsWith(`${y}-${m}-`)) {
            const s = workData[k].shift;
            if (s === 'Full') { full++; hrs += 13; }
            else if (s) { half++; hrs += 7; }
        }
    }
    const rate = parseInt(document.getElementById('hourlyRateInput').value) || 0;
    document.getElementById('totalFull').innerText = full;
    document.getElementById('totalHalf').innerText = half;
    document.getElementById('totalMoney').innerText = (hrs * rate).toLocaleString() + "đ";
}

function copyReport() {
    let m = currentMonth + 1;
    let txt = `📊 BÁO CÁO LƯƠNG THÁNG ${m}\n----------------\n- Ca Full: ${document.getElementById('totalFull').innerText}\n- Ca Nửa: ${document.getElementById('totalHalf').innerText}\n- Tổng nhận: ${document.getElementById('totalMoney').innerText}\n\nBé làm vất vả rồi, yêu Anh! ❤️`;
    navigator.clipboard.writeText(txt);
    alert("Đã copy báo cáo!");
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Offline mode sẵn sàng!', reg))
      .catch(err => console.log('Lỗi offline:', err));
  });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Hiện một cái thông báo nhẹ
                    alert("Đã có bản cập nhật mới! Bé tắt App mở lại để thấy thay đổi nhé ❤️");
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
    renderCalendar();
}


let startX = 0;

let slider = null;

function initSlider() {
    slider = document.getElementById("monthSlider");
    if (!slider) return;

    slider.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", e => {
        handleSwipe(e.changedTouches[0].clientX);
    });

    slider.addEventListener("mousedown", e => {
        startX = e.clientX;
    });

    slider.addEventListener("mouseup", e => {
        handleSwipe(e.clientX);
    });
}


function handleSwipe(endX) {
    let diff = endX - startX;

    if (diff < -50) changeMonth(1);      // Swipe trái
    if (diff > 50) changeMonth(-1);      // Swipe phải
}

let selectedBranch = localStorage.getItem("selectedBranch") || "176";

document.querySelectorAll(".branch-card").forEach(card => {
    if (card.dataset.branch === selectedBranch)
        card.classList.add("active");

    card.addEventListener("click", () => {
        selectedBranch = card.dataset.branch;
        localStorage.setItem("selectedBranch", selectedBranch);

        document.querySelectorAll(".branch-card")
            .forEach(c => c.classList.remove("active"));

        card.classList.add("active");
        updateCountdown();
    });
});

function enableCalendarSwipe() {
    const calendar = document.getElementById("calendarGrid");
    let startX = 0;

    calendar.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    calendar.addEventListener("touchend", (e) => {
        let endX = e.changedTouches[0].clientX;
        handleSwipe(startX, endX);
    });

    calendar.addEventListener("mousedown", (e) => {
        startX = e.clientX;
    });

    calendar.addEventListener("mouseup", (e) => {
        let endX = e.clientX;
        handleSwipe(startX, endX);
    });

    function handleSwipe(start, end) {
        const diff = end - start;
        if (Math.abs(diff) < 50) return;

        if (diff < 0) {
            // Vuốt trái → tháng sau
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        } else {
            // Vuốt phải → tháng trước
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
        }

        updateMonthDisplay();
        renderCalendar();
    }
}