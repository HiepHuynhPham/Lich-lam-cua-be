import { registerUser, loginUser } from "./api.js";
import { saveUser, loadUser, clearUser } from "./storage.js";
import { showApp, toggleAuthForm } from "./ui.js";
import { initApp } from "./main.js";

function handleRegistration() {
  const u = document.getElementById("reg-user").value.trim();
  const p = document.getElementById("reg-pass").value.trim();

  registerUser(u, p).then((data) => {
    if (data === "USER_EXISTS") {
      alert("Tài khoản đã tồn tại!");
    } else {
      alert("Đăng ký thành công!");
      toggleAuthForm();
    }
  });
}

function handleLogin() {
  const u = document.getElementById("login-user").value.trim();
  const p = document.getElementById("login-pass").value.trim();

  loginUser(u, p).then((data) => {
    if (data === "LOGIN_FAILED") {
      alert("Sai tài khoản hoặc mật khẩu!");
    } else {
      saveUser(u);
      localStorage.setItem("workData_v6", data); // This should be updated to v7 eventually
      const workData = JSON.parse(data);
      initApp(u, workData);
    }
  });
}

function handleLogout() {
  clearUser();
  location.reload();
}

function checkCurrentUser() {
  const user = loadUser();
  if (user) {
    initApp(user);
  }
}

export {
  handleRegistration,
  handleLogin,
  handleLogout,
  checkCurrentUser,
  toggleAuthForm,
};
