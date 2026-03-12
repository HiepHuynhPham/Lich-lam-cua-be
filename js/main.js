import {
  checkCurrentUser,
  handleLogin,
  handleLogout,
  toggleAuthForm,
  handleRegistration,
} from "./auth.js";
import { initCalendar, initSlider, currentYear, currentMonth } from "./calendar.js";
import { updateCountdown } from "./countdown.js";
import {
  openModal,
  toggleShift,
  clearShift,
  togglePeriod,
  saveAndRefresh,
  closeModal,
} from "./modal.js";
import { calculateSalary, copyReport } from "./salary.js";
import { saveBranch, loadBranch } from "./storage.js";
import { showApp } from "./ui.js";

function initApp(user, workData) {
  showApp(user);
  initSlider();
  initCalendar();
  updateCountdown();
  calculateSalary(currentYear, currentMonth);
  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById("login-button").addEventListener("click", handleLogin);
  document.getElementById("register-button").addEventListener("click", handleRegistration);
  document.getElementById("toggle-register").addEventListener("click", toggleAuthForm);
    document.getElementById("toggle-login").addEventListener("click", toggleAuthForm);

  document.getElementById("logout-button").addEventListener("click", handleLogout);

  document.querySelectorAll(".branch-card").forEach((card) => {
    card.addEventListener("click", () => {
      const selectedBranch = card.dataset.branch;
      saveBranch(selectedBranch);

      document
        .querySelectorAll(".branch-card")
        .forEach((c) => c.classList.remove("active"));

      card.classList.add("active");
      updateCountdown();
    });
  });

    document.getElementById("hourlyRateInput").addEventListener("input", () => {
        calculateSalary(currentYear, currentMonth);
    });

  document.getElementById("copy-report-button").addEventListener("click", () => {
      copyReport(currentYear, currentMonth);
  });

  // Modal buttons
    document.querySelector(".btn-full").addEventListener("click", (e) => toggleShift(e.target, "Full"));
    document.querySelector(".btn-half[data-shift='Sáng']").addEventListener("click", (e) => toggleShift(e.target, "Sáng"));
    document.querySelector(".btn-half[data-shift='Chiều']").addEventListener("click", (e) => toggleShift(e.target, "Chiều"));
    document.querySelector(".btn-half[data-shift='Tối']").addEventListener("click", (e) => toggleShift(e.target, "Tối"));
    document.querySelector(".btn-period").addEventListener("click", togglePeriod);
    document.querySelector(".btn-delete").addEventListener("click", clearShift);
    document.getElementById("save-button").addEventListener("click", saveAndRefresh);
    document.getElementById("cancel-button").addEventListener("click", closeModal);


  // Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => console.log("Offline mode sẵn sàng!", reg))
        .catch((err) => console.log("Lỗi offline:", err));
    });

    navigator.serviceWorker.register("./sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            alert(
              "Đã có bản cập nhật mới! Bé tắt App mở lại để thấy thay đổi nhé ❤️",
            );
          }
        });
      });
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {
    checkCurrentUser();
});

export { initApp };
