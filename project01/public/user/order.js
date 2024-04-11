const addressBtn = document.querySelector(".addAddressBtn");
const myFormGroup = document.querySelector(".form-group");
const myForm = document.querySelector("form");
const cancleBtn = document.querySelector(".cancle");
const sendInfo = document.querySelector(".send-info");
const billBtn = document.querySelector(".billBtn");
const itemNames = document.querySelectorAll(".itemName");
const codBtn = document.querySelector(".CODBtn");
addressBtn.addEventListener("click", () => {
  myFormGroup.style.display = "block";
});

cancleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  myFormGroup.style.display = "none";
});

myForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let method = sendInfo ? "PATCH" : "post";

  let response = await fetch("/user/addAddress", {
    method: method,
    body: new FormData(myForm),
  });
  console.log(response);
  if (response.ok) {
    location.href = location.href;
  }
});
if (billBtn) {
  billBtn.addEventListener("click", async () => {
    try {
      const amount = document.querySelector(".amount").innerHTML;
      let itemName = "";
      //url的params
      const urlParams = new URLSearchParams(location.search);
      const paramValue = urlParams.get("id");
      //綠界api 產品名稱，多產品用#隔開
      itemNames.forEach((item) => (itemName += item.innerHTML + "#"));
      let response = await fetch("/user/pay", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemName, amount, paramValue }),
      });
      const responseData = await response.json();
      document.body.insertAdjacentHTML("beforeend", responseData.data);
      document.forms["payment"].submit();
    } catch (e) {
      console.error("Error", e);
    }
  });
}

codBtn.addEventListener("click", async () => {
  try {
    const urlParams = new URLSearchParams(location.search);
    const paramValue = urlParams.get("id");
    console.log(paramValue);
    let response = await fetch("/user/cod", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paramValue }),
    });
    const responseData = await response.text();
    if (responseData == "ok") {
      alert("下單成功,轉回首頁");
      location.href = "/";
    } else {
      alert("系統出問題，重新支付");
    }
    console.log(responseData);
  } catch (e) {
    console.error("Error", e);
  }
});
