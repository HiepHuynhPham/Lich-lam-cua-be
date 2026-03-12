import { loadWorkData } from "./storage.js";

function calculateSalary(year, month) {
  const workData = loadWorkData();
  let hrs = 0;
  let m = month + 1;
  let y = year;

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

function copyReport(year, month) {
  let m = month + 1;
  let txt = `📊 BÁO CÁO LƯƠNG THÁNG ${m}\n----------------\n- Ca Full: ${
    document.getElementById("totalFull").innerText
  }\n- Ca Nửa: ${
    document.getElementById("totalHalf").innerText
  }\n- Tổng nhận: ${
    document.getElementById("totalMoney").innerText
  }\n\nBé làm vất vả rồi, yêu Anh! ❤️`;
  navigator.clipboard.writeText(txt);
  alert("Đã copy báo cáo!");
}

export { calculateSalary, copyReport };
