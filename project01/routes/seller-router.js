const Pricing = require("twilio/lib/rest/Pricing");
const Products = require("../models/user-model");
const Orders = require("../models/user-model");
const Cart = require("../models/user-model");
router = require("express").Router();
const accessToken = process.env.accessToken;

//新增商品頁面
router.get("/products", (req, res) => {
  return res.render("addProduct", { user: req.user });
});

//新增商品
router.post("/products", async (req, res) => {
  try {
    const { productName, description, price, quantity, imageUrl } = req.body;
    let [result, field] = await Products.promise().query(
      "INSERT INTO products(name, description, price, quantity, imageUrl,ownerId) VALUES (?,?,?,?,?,?)",
      [productName, description, price, quantity, imageUrl, req.user.id]
    );
    return res, send("新增成功");
  } catch (e) {
    return res.send(e);
  }
});

//我的商品頁面
router.get("/myProducts", async (req, res) => {
  try {
    let [shopee, field] = await Products.promise().query(
      "select * from products where ownerid=?",
      [req.user.id]
    );

    return res.render("myProducts", { user: req.user, shopee });
  } catch (e) {
    return res.send("資料獲取失敗");
  }
});

// 下架
router.delete("/products/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let [result, fields] = await Orders.promise().query(
      "SELECT * FROM orders where productId=?",
      [id]
    );

    await Products.promise().query("DELETE FROM products WHERE id=?", [id]);

    return res.send("ok");
  } catch (e) {
    return res
      .status(400)
      .send("還有訂單未完成或使用者的購物車有該產品導致資料無法刪除");
  }
});

//單一商品頁面
router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let [product, field] = await Products.promise().query(
      `select p.*, u.username
      from products p left join user u on  p.ownerId=u.id 
      where p.id=?`,
      [id]
    );
    let [cart, fields] = await Cart.promise().query(
      "select * from cart where userId=?",
      [req.user.id]
    );
    const items = cart.length;
    return res.render("product", {
      user: req.user,
      product: product[0],
      items,
    });
  } catch (e) {
    return res.send("資料尋找失敗");
  }
});

//圖片上傳到imgur
router.post("/productImg", async (req, res) => {
  const { imgData } = req.body;
  let myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${accessToken}`);
  let formdata = new FormData();
  formdata.append("image", imgData);
  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };
  try {
    const response = await fetch(
      "https://api.imgur.com/3/image",
      requestOptions
    );
    let data = await response.text();
    data = JSON.parse(data);

    return res.send({ url: data.data.link });
  } catch (e) {
    console.log(e);
    return res.status(400).send("圖片上傳失敗");
  }
});

module.exports = router;
