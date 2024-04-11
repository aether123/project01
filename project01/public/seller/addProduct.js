const uploadBtn = document.querySelector(".uploadBtn"); //上傳商品圖片按鈕
const fileUploader = document.querySelector("#file-uploader"); //商品圖片的<input>
const closeFile = document.querySelector(".closeFile"); //商品圖片關閉<img>
const previewImg = document.querySelector(".previewImg"); //商品圖片<img>
const productName = document.querySelector("#productName"); //商品名稱<textarea>
const description = document.querySelector("#description");
const formBtn = document.querySelector(".form-btn");
const form = document.querySelector("form");
const descriptionLimit = document.querySelector(".descriotion-limit");
const productNameLimit = document.querySelector(".productName-limit");
const errorMessage = document.querySelector(".error-msg");
const clientId = "{{clientId}}";

//點擊<a>時等同於點擊<input>標籤
uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fileUploader.click();
});
//照片上傳時顯示照片
fileUploader.addEventListener("change", (e) => {
  let file = fileUploader.files[0];

  if (file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
      closeFile.style.display = "block";
    };
  } else {
    alert("請上傳圖片");
  }
});
//關閉檔案
closeFile.addEventListener("click", () => {
  previewImg.src = "";
  previewImg.style.display = "none";
  closeFile.style.display = "none";
});

// 填寫商品名稱
productName.addEventListener("input", () => {
  autoResizeTextarea(productName);
  const limit = 50;
  let count = productName.value.length;
  productNameLimit.innerHTML = `${count}/${limit}`;
});
//填寫商品描述
description.addEventListener("input", (e) => {
  autoResizeTextarea(description);
  const limit = 300;
  let count = description.value.length;
  descriptionLimit.innerHTML = `${count}/${limit}`;
});
//自動調整textarea 大小
function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

formBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  let valid = true;
  //獲取所有form的key-val
  let formData = new FormData(form);
  //確認表單都填寫完畢
  formData.forEach((val, key) => {
    if (val.trim() === "" || previewImg.style.display == "none") {
      valid = false;
      errorMessage.innerHTML = "<p>確認表單是否填寫完畢</p>";
    }
  });

  if (valid) {
    errorMessage.innerHTML = "";
    const imgData = previewImg.src.split(",")[1];
    console.log(imgData);
    try {
      // 將圖片送到後端傳給imgur 獲取url
      const response = await fetch("/seller/productImg", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imgData }),
      });
      if (!response.ok) {
        throw new Error("圖檔太大");
      }
      const data = await response.json();
      //將表格與url存到資料庫
      formData.append("imageUrl", data.url);

      let result = await fetch("/seller/products", {
        method: "post",
        body: formData,
      });
      if (!result.ok) {
        throw new Error("資料庫儲存失敗");
      } else {
        alert("新增成功");
      }
    } catch (e) {
      alert(e.message);
      console.log(e);
    }
  }
});
