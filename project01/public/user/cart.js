const quantityInputs = document.querySelectorAll("#quantity");
const deleteBtns = document.querySelectorAll(".delete-btn");
const checkAllItem = document.querySelector(".check-all");
const checkItems = document.querySelectorAll(".check");
const amountElement = document.querySelector(".amount");
const allItem = document.querySelectorAll(".item");
const orderBtn = document.querySelector(".order-btn");
//數量增加減少
quantityInputs.forEach((item) => {
  item.addEventListener("change", async (e) => {
    const parentElement = e.target.parentElement.parentElement; //找到公同父曾
    const priceElement = parentElement.querySelector(".price"); //單價
    let totalPriceElement = parentElement.querySelector(".total-price"); //總價
    const preTotalPrice = totalPriceElement.innerHTML; //更改前總價
    const quantity = item.value; //數量值
    const price = priceElement.innerHTML; //單價值
    const totalPrice = quantity * price; //新總價
    totalPriceElement.innerHTML = totalPrice; //更新單品項總價
    //更新資料庫
    const btn = parentElement.querySelector(".btn");
    const cartId = btn.id;
    try {
      await fetch(`/user/cart/${cartId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
      console.log(123);
    } catch (e) {
      console.log(e);
    }

    const checked = parentElement.querySelector(".check").checked;
    console.log(checked);
    if (checked) {
      //所有商品的值,先砍掉舊的總價再加入新的總價
      let amount = parseInt(amountElement.innerHTML - preTotalPrice);
      amount += parseInt(totalPrice);
      amountElement.innerHTML = amount;
    }
  });
});

//刪除按鈕
deleteBtns.forEach((button) => {
  button.addEventListener("click", async (e) => {
    const cartId = button.id;
    let response = await fetch(`/user/cart/${cartId}`, {
      method: "delete",
    });

    if (response.ok) {
      location.href = "/user/cart";
    }
  });
});

//勾選所有商品
checkAllItem.addEventListener("change", () => {
  let amount = 0;
  const checked = checkAllItem.checked;
  checkItems.forEach((item) => {
    item.checked = checked;
  });
  if (checked) {
    allItem.forEach((item) => {
      const totalPrice = item.querySelector(".total-price").innerHTML;
      console.log(totalPrice);
      amount += parseInt(totalPrice);
      console.log(amount);
    });
  } else {
    amount = 0;
  }
  amountElement.innerHTML = amount;
});

//勾選單項商品
checkItems.forEach((checkItem) => {
  checkItem.addEventListener("change", (e) => {
    const checked = checkItem.checked;
    const parentElement = e.target.parentElement.parentElement;
    const TotalPrice = parseInt(
      parentElement.querySelector(".total-price").innerHTML
    );
    let amount = parseInt(amountElement.innerHTML);

    if (checked) {
      amount += TotalPrice;
    } else {
      amount -= TotalPrice;
    }
    amountElement.innerHTML = amount;
  });
});

//下訂單
orderBtn.addEventListener("click", async () => {
  let id = "";
  checkItems.forEach((item) => {
    if (item.checked) {
      const parentElement = item.parentElement.parentElement;
      const btn = parentElement.querySelector(".btn");
      const cartId = btn.id;
      id = id + cartId + ",";
    }
  });
  location.href = `/user/order?id=${id}`;
});
