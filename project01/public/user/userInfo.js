const fileInput = document.querySelector(".file");
const fileBtn = document.querySelector(".file-btn");
const form = document.querySelector("form");
const save = document.querySelector(".save");
const changeInfo = document.querySelectorAll("a");
const previewImg = document.querySelector(".img");
const inputArray = document.querySelectorAll("input");

fileBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  let file = fileInput.files[0];
  if (file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      previewImg.src = e.target.result;
    };
  } else {
    alert("請上傳圖片");
  }
});

//修改資料
save.addEventListener("click", async (e) => {
  e.preventDefault();
  let formData = new FormData();
  const imgData = previewImg.src.split(",")[1];
  if (inputArray.length > 0) {
    inputArray.forEach((input) => {
      if (input.value && input.name) {
        formData.append(`${input.name}`, input.value);
      }
    });
  }

  try {
    // 將圖片送到後端傳給imgur 獲取url
    if (imgData) {
      const response = await fetch("/seller/productImg", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imgData }),
      });
      const data = await response.json();
      //將表格與url存到資料庫
      formData.append("photo", data.url);
      if (!response.ok) {
        throw new Error("圖檔太大");
      }
    }
    let response = await fetch("/user/userInfo", {
      method: "PATCH",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("儲存失敗");
    }
    const responseData = await response.text();

    alert(responseData);
    location.reload();
  } catch (e) {
    alert(e.message);
    console.log(e);
  }
});

changeInfo.forEach((info) => {
  info.addEventListener("click", () => {
    const infoInput = info.parentElement.parentElement.querySelector("input");
    const infoValue = info.parentElement.parentElement.querySelector("p");
    infoInput.style.display = "block";
    infoValue.style.display = "none";
  });
});
