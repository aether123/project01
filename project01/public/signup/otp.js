const validInput = document.querySelector(".validNumber");
let validNumber;
const btn = document.querySelector(".next-btn");

const resendBtn = document.querySelector(".resend");

btn.disabled = true;
let phoneNumber = document.querySelector(".phoneNumber").innerHTML;
validInput.addEventListener("input", () => {
  validNumber = validInput.value;
  if (validNumber.length == 6) {
    btn.disabled = false;
  }
});

btn.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    let response = await fetch("/auth/signup/checkotp", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, validNumber }),
    });
    let data = await response.json();

    if (data.status) {
      location.href = "/auth/signup/setpassword";
    } else {
      let erro_message = document.querySelector(".error-msg");
      erro_message.innerHTML = "<p>驗證碼不正確</p>";
    }
  } catch (e) {
    alert("重新傳送簡訊");
    console.log(e);
  }
});

resendBtn.addEventListener("click", async () => {
  let response = await fetch("/auth/signup/otp", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });
});
