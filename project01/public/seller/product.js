let url = window.location.href.split("/");
const productId = url[url.length - 1];
const addCartBtn = document.querySelector(".add-cart-btn");
const purchase = document.querySelector(".purchase");
let isPurchase = true;

addCartBtn.addEventListener("click", async () => {
  isPurchase = false;
  const quantity = document.querySelector("#quantity").value;
  // cart 添加紀錄
  try {
    let response = await fetch("/user/cart", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity, isPurchase }),
    });
    let data = await response.text();
    alert(data);
  } catch (e) {
    console.log(e);
  }
});

purchase.addEventListener("click", async () => {
  isPurchase = true;
  try {
    const quantity = document.querySelector("#quantity").value;
    let response = await fetch("/user/cart", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity, isPurchase }),
    });
    let data = await response.text();
    console.log(data);
    if (data) {
      location.href = "/user/cart";
    }
  } catch (e) {
    console.log(e);
  }
});
