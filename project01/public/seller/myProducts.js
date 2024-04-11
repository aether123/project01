soldOut = document.querySelector(".sold-out"); //已售完a tag
forSale = document.querySelector(".for-sale"); //架上 a tag
all = document.querySelector(".all"); //全部 a tag
soldOutItems = document.querySelectorAll(".sold-out-item"); //已售完item
forSaleItems = document.querySelectorAll(".for-sale-item"); //架上item
const recalls = document.querySelectorAll(".recall");
const relists = document.querySelectorAll(".relist");
soldOut.addEventListener("click", (e) => {
  e.preventDefault();
  toggleDisplay("block", "none");
});

forSale.addEventListener("click", (e) => {
  e.preventDefault();
  toggleDisplay("none", "block");
});

all.addEventListener("click", (e) => {
  e.preventDefault();
  toggleDisplay("block", "block");
});

document.addEventListener("DOMContentLoaded", () => {
  toggleDisplay("block", "block");
});

function toggleDisplay(soldOutDisplay, forSaleDisplay) {
  soldOutItems.length > 0 &&
    soldOutItems.forEach((item) => (item.style.display = soldOutDisplay));
  forSaleItems.length > 0 &&
    forSaleItems.forEach((item) => (item.style.display = forSaleDisplay));
}

recalls.forEach((recall) => {
  recall.addEventListener("click", async (e) => {
    try {
      e.preventDefault();
      const id = recall.parentElement.id;
      let response = await fetch(`/seller/products/${id}`, {
        method: "delete",
      });
      let data = await response.text();
      if (data == "ok") {
        location.reload();
      } else {
        alert(data);
      }
    } catch (e) {
      alert(e);
    }
  });
});
