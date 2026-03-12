import { saveData, loadWorkData, loadBranch, loadUser } from "./storage.js";
import { syncData } from "./api.js";
import { closeModal, openModalUi } from "./ui.js";
import { renderCalendar } from "./calendar.js";
import { updateCountdown } from "./countdown.js";
import { calculateSalary } from "./salary.js";

let selectedDateKey = null;
let selectedShifts = [];
let workData = loadWorkData();

function openModal(key) {
  selectedDateKey = key;
  const data = workData[key] || { shift: [], note: "", isPeriod: false };
  selectedShifts = Array.isArray(data.shift) ? data.shift : [];
  openModalUi(key, data);
}

function toggleShift(btn, shift) {
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

function clearShift() {
  selectedShifts = [];
  if (workData[selectedDateKey]) {
    workData[selectedDateKey].shift = null;
  }
  document.querySelectorAll(".btn-group button").forEach((btn) => {
    btn.classList.remove("active-shift");
  });
}

function togglePeriod() {
  if (!workData[selectedDateKey])
    workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };
  workData[selectedDateKey].isPeriod = !workData[selectedDateKey].isPeriod;

  const periodBtn = document.querySelector(".btn-period");
  periodBtn.innerText = workData[selectedDateKey].isPeriod
    ? "Xóa Ngày Dâu 🧊"
    : "Ngày Dâu 🩸";
}

function saveAndRefresh() {
  if (!selectedDateKey) return;

  const noteContent = document.getElementById("dayNote").value;

  if (!workData[selectedDateKey])
    workData[selectedDateKey] = { shift: null, isPeriod: false, note: "" };
  workData[selectedDateKey].shift = selectedShifts;
  workData[selectedDateKey].note = noteContent;
  workData[selectedDateKey].branch = loadBranch();

  saveData(workData);

  const data = workData[selectedDateKey];
  if (data) {
    syncData(
      loadUser(),
      workData,
      selectedDateKey,
      data.shift,
      data.note,
      loadBranch(),
    );
  }

  const [year, month] = selectedDateKey.split("-").map(Number);
  renderCalendar(year, month - 1);
  closeModal();
  updateCountdown();
  calculateSalary(year, month - 1);
}

function saveNote() {
    saveAndRefresh();
}

export {
  openModal,
  toggleShift,
  clearShift,
  togglePeriod,
  saveAndRefresh,
  saveNote,
  closeModal,
};
