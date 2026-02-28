let workData = JSON.parse(localStorage.getItem('workData_v5')) || {};
let currentUser = localStorage.getItem('loggedUser') || null;
let selectedDateKey = null;

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwVf6cTbWCLxyIwXVdR9GIXgsQC_lndTR0iutKyiSxvglR8YDljwmqC6X4wiWCIYXu_Xw/exec";

window.onload = () => {
    if (currentUser) showApp(currentUser);
    setInterval(updateCountdown, 1000);
    const savedBranch = localStorage.getItem('selectedBranch');
    if (savedBranch) document.getElementById('branchSelect').value = savedBranch;
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
    if (u && p) { localStorage.setItem(`user_${u}`, p); alert("Đã tạo tài khoản!"); toggleForm(); }
}

function login() {
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value.trim();
    if (localStorage.getItem(`user_${u}`) === p) {
        localStorage.setItem('loggedUser', u);
        showApp(u);
    } else alert("Sai rồi bé ơi!");
}

function showApp(user) {
    document.getElementById('auth-card').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('hello-user').innerText = `Chào ${user}! 🌸`;
    initCalendar();
}

function logout() { localStorage.removeItem('loggedUser'); location.reload(); }

// --- LOGIC LỊCH & DỰ BÁO NGÀY DÂU ---
function initCalendar() {
    const mSel = document.getElementById('selectMonth');
    const ySel = document.getElementById('selectYear');
    const now = new Date();
    if (mSel.options.length === 0) {
        for (let i = 0; i < 12; i++) mSel.innerHTML += `<option value="${i}" ${i === now.getMonth()?'selected':''}>Tháng ${i+1}</option>`;
        for (let i = now.getFullYear()-1; i <= now.getFullYear()+1; i++) ySel.innerHTML += `<option value="${i}" ${i === now.getFullYear()?'selected':''}>Năm ${i}</option>`;
    }
    renderCalendar();
}

function renderCalendar() {
    const month = parseInt(document.getElementById('selectMonth').value);
    const year = parseInt(document.getElementById('selectYear').value);
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
    const branch = document.getElementById('branchSelect').value;
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
    saveAndRefresh();
}

function togglePeriod() {
    if(!workData[selectedDateKey]) workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };
    workData[selectedDateKey].isPeriod = !workData[selectedDateKey].isPeriod;
    saveAndRefresh();
}

function saveNote() {
    if(!workData[selectedDateKey]) workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };
    workData[selectedDateKey].note = document.getElementById('dayNote').value;
    saveAndRefresh();
}

// --- ĐỒNG BỘ GOOGLE SHEETS ---
function syncToSheets(ngay, loai, luong, ghiChu) {
    // Dùng URLSearchParams là cách an toàn nhất để Google Sheets nhận dữ liệu mà không bị lỗi
    const params = new URLSearchParams();
    params.append('ngay', ngay);
    params.append('loai', loai);
    params.append('luong', luong);
    params.append('ghiChu', ghiChu);

    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Bắt buộc phải có để lách luật bảo mật trình duyệt
        body: params
    })
    .then(() => console.log("Dữ liệu đã bay sang Sheets của Anh! 🚀"))
    .catch(err => console.error("Lỗi gửi dữ liệu:", err));
}

function saveAndRefresh() {
    // 1. Lưu vào LocalStorage
    localStorage.setItem('workData_v5', JSON.stringify(workData));

    // 2. Gửi dữ liệu sang Google Sheets cho Anh
    const data = workData[selectedDateKey];
    const rate = parseInt(document.getElementById('hourlyRateInput').value) || 0;
    let tienCa = 0;
    if (data.shift === 'Full') tienCa = rate * 13;
    else if (data.shift) tienCa = rate * 7;

    const loaiHienThi = data.isPeriod ? `${data.shift || 'Nghỉ'} + Dâu 🩸` : (data.shift || 'Nghỉ');

    syncToSheets(selectedDateKey, loaiHienThi, tienCa, data.note || "");

    // 3. Cập nhật giao diện
    renderCalendar();
    closeModal();
    updateCountdown();
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

function calculateSalary() {
    let full = 0, half = 0, hrs = 0, m = parseInt(document.getElementById('selectMonth').value)+1, y = parseInt(document.getElementById('selectYear').value);
    for (let k in workData) {
        if (k.startsWith(`${y}-${m}-`)) {
            const s = workData[k].shift;
            if (s === 'Full') { full++; hrs += 13; }
            else if (s) { half++; hrs += 7; }
        }
    }
    const rate = parseInt(document.getElementById('hourlyRateInput').value);
    document.getElementById('totalFull').innerText = full;
    document.getElementById('totalHalf').innerText = half;
    document.getElementById('totalMoney').innerText = (hrs * rate).toLocaleString() + "đ";
}

function copyReport() {
    let m = parseInt(document.getElementById('selectMonth').value)+1;
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