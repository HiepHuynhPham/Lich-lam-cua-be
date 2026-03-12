import { loadWorkData, loadBranch } from "./storage.js";
import { formatDateLocal } from "./utils.js";

function updateCountdown() {
  const workData = loadWorkData();
  const selectedBranch = loadBranch();
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
    
    if (shift === "Full") {
        startH = 9;
        startM = 0;
        endH = 22;
        endM = 0;
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
      `Ca ${shift} (${startH}:${String(startM).padStart(2, "0")} - ${endH}:${String(
        endM,
      ).padStart(2, "0")})\n` + `Còn ${h}h ${m}p nữa vào ca 💼`;
  } else {
    const diff = end - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);

    el.innerText =
      `Ca ${shift} (${startH}:${String(startM).padStart(2, "0")} - ${endH}:${String(
        endM,
      ).padStart(2, "0")})\n` + `Còn ${h}h ${m}p nữa tan ca 🥰`;
  }
}

export { updateCountdown };
