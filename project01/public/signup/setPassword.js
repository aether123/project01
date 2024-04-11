const passwordInput = document.querySelector(".password");
const usernameInput = document.querySelector(".username");
const emailInput = document.querySelector(".email");
const checkPasswordInput = document.querySelector(".checkPassword");
const btn = document.querySelector(".btn");
let password;
let checkPassword;
let username;
let emailIsOk = false;
btn.disabled = true;
function updateButtonState() {
  btn.disabled = !(
    password == checkPassword &&
    username &&
    emailIsOk &&
    password &&
    checkPassword
  );
}

usernameInput.addEventListener("input", () => {
  username = usernameInput.value;
  updateButtonState();
});

passwordInput.addEventListener("input", () => {
  password = passwordInput.value;
  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const errMsg = document.querySelector(".passwordMsg");
  if (!passwordRegex.test(password)) {
    errMsg.innerHTML =
      "<p>密碼長度要大於八位數</p><p>密碼必須包含數字與英文</p><p>密碼至少一位大寫英文</p>";
  } else {
    errMsg.innerHTML = "";
  }
  updateButtonState();
});

checkPasswordInput.addEventListener("input", () => {
  checkPassword = checkPasswordInput.value;
  updateButtonState();
});

emailInput.addEventListener("input", () => {
  emailIsOk = false;
  let email = emailInput.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errMsg = document.querySelector(".err-email-msg");
  if (!emailRegex.test(email)) {
    errMsg.innerHTML = "<p>信箱格式不正確</p>";
  } else {
    errMsg.innerHTML = "";
    emailIsOk = true;
  }
  updateButtonState();
});

btn.addEventListener("click", async () => {
  let email = emailInput.value;
  username = usernameInput.value;
  try {
    let response = await fetch("/auth/signup/setpassword", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (response.status == 400) {
      throw new Error("手機或信箱已經被註冊請修改");
    } else if (response.status == 500) {
      throw new Error("儲存失敗");
    }

    if (response.redirected) {
      location.href = response.url;
    }
  } catch (e) {
    alert(e.message);
    console.log(e);
  }
});
