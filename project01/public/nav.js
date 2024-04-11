const seller = document.querySelector(".seller-item");
const sellerContent = document.querySelector(".items");
const userItem = document.querySelector(".user-items");
const userContent = document.querySelector(".user-content");

seller.addEventListener("mouseover", () => {
  sellerContent.style.display = "block";
});

seller.addEventListener("mouseleave", () => {
  sellerContent.style.display = "none";
});

userItem.addEventListener("mouseover", () => {
  userContent.style.display = "block";
});

userItem.addEventListener("mouseleave", () => {
  userContent.style.display = "none";
});
