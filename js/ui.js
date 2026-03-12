function showApp(user) {
  document.getElementById("auth-card").classList.add("hidden");
  document.getElementById("main-app").classList.remove("hidden");
  document.getElementById("hello-user").innerText = `Chào ${user}! 🌸`;
}

function toggleAuthForm() {
  document.getElementById("login-form").classList.toggle("hidden");
  document.getElementById("register-form").classList.toggle("hidden");
}

function updateMonthDisplay(year, month) {
  document.getElementById("monthDisplay").innerText = `Tháng ${
    month + 1
  } - ${year}`;
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function openModalUi(dateKey, data) {
    const [y, m, d] = dateKey.split("-");

    document.getElementById("modalDate").innerText = `Ngày ${d}/${m}/${y}`;
    document.getElementById("dayNote").value = data.note || "";

    document
        .querySelectorAll(".btn-group button")
        .forEach((b) => b.classList.remove("active-shift"));

    const selectedShifts = Array.isArray(data.shift) ? data.shift : [];
    selectedShifts.forEach((shift) => {
        const btn = document.querySelector(`[data-shift="${shift}"]`);
        if (btn) btn.classList.add("active-shift");
    });

    const periodBtn = document.querySelector(".btn-period");
    periodBtn.innerText = data.isPeriod ? "Xóa Ngày Dâu 🧊" : "Ngày Dâu 🩸";

    document.getElementById("modal").style.display = "flex";
}

export { showApp, toggleAuthForm, updateMonthDisplay, closeModal, openModalUi };
