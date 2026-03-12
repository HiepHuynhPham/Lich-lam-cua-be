const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwVf6cTbWCLxyIwXVdR9GIXgsQC_lndTR0iutKyiSxvglR8YDljwmqC6X4wiWCIYXu_Xw/exec";

async function registerUser(username, password) {
  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "register",
      username,
      password,
    }),
  });
  return await response.text();
}

async function loginUser(username, password) {
  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "login",
      username,
      password,
    }),
  });
  return await response.text();
}

async function syncData(username, workData, dateKey, shift, note, branch) {
  const params = new URLSearchParams({
    action: "saveData",
    username,
    data: JSON.stringify(workData),
    ngay: dateKey,
    ca: shift || "Nghỉ",
    ghiChu: note || "",
    chiNhanh: branch,
  });

  return fetch(SCRIPT_URL, {
    method: "POST",
    body: params,
  });
}

export { registerUser, loginUser, syncData };
