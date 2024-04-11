let btn = document.querySelector(".next-btn"); //按鈕
btn.disabled = true;
let vaild = false;
let phoneInput = document.getElementById("form-input");
let phoneNumber;
//監聽手機號碼輸入
phoneInput.addEventListener("input", () => {
  phoneNumber = phoneInput.value; //獲取使用者輸入的值
  const erro_message = document.querySelector(".erro-message");
  const taiwanPhoneRegex = /^09\d{8}$/; //台灣手機號碼正規表達法
  //手機格式不對跳出錯誤訊息
  if (phoneNumber && !taiwanPhoneRegex.test(phoneNumber)) {
    erro_message.innerHTML = "<p>手機格是不正確</p>";
  } else {
    erro_message.innerHTML = "";
    vaild = true;
    btn.disabled = false;
  }
});

btn.addEventListener("click", async (e) => {
  try {
    if (vaild) {
      e.preventDefault();
      let response = await fetch("/auth/signup/otp", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      if (response.redirected) {
        window.location.href = response.url;
      }
    }
  } catch (e) {
    console.log(e);
  }
});
