let saveTimer = null;

function saveData(workData) {
  clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    localStorage.setItem("workData_v7", JSON.stringify(workData));
  }, 250);
}

function safeParse(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function loadWorkData() {
  let workData =
    safeParse("workData_v7") ||
    safeParse("workData_v6") ||
    safeParse("workData_v5") ||
    {};

  // Migrate old data format if needed
  let newData = {};
  for (let k in workData) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
      newData[k] = workData[k];
    } else {
      const parts = k.split("/");
      if (parts.length === 3) {
        const d = parts[0].padStart(2, "0");
        const m = parts[1].padStart(2, "0");
        const y = parts[2];
        newData[`${y}-${m}-${d}`] = workData[k];
      }
    }
  }
  return newData;
}

function saveBranch(branch) {
  localStorage.setItem("selectedBranch", branch);
}

function loadBranch() {
  return localStorage.getItem("selectedBranch") || "503";
}

function saveUser(user) {
  localStorage.setItem("loggedUser", user);
}

function loadUser() {
  return localStorage.getItem("loggedUser") || null;
}

function clearUser() {
  localStorage.removeItem("loggedUser");
}

export {
  saveData,
  loadWorkData,
  saveBranch,
  loadBranch,
  saveUser,
  loadUser,
  clearUser,
};
