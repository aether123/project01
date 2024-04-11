router = require("express").Router();
const Cart = require("../models/user-model");
const Address = require("../models/user-model");
const User = require("../models/user-model");
const Orders = require("../models/user-model");
const ShortUniqueId = require("short-unique-id");
const Products = require("../models/user-model");
const moment = require("moment");
const SHA256 = require("crypto-js/sha256");

//使用者資訊
router.get("/userInfo", (req, res) => {
  return res.render("userInfo", { user: req.user });
});

router.patch("/userInfo", async (req, res) => {
  try {
    values = Object.keys(req.body)
      .map((key) => `${key}=?`)
      .join(",");
    params = Object.values(req.body);
    console.log(values, params);
    await User.promise().query(`UPDATE user set ${values} where id=?`, [
      ...params,
      req.user.id,
    ]);
    return res.send("更新成功");
  } catch (e) {
    return res.status(400).send("儲存失敗");
  }
});
//npm short-unique-id  crypto-js
//購物車新增商品
router.post("/cart", async (req, res) => {
  try {
    const { productId, quantity, isPurchase } = req.body;
    let [result, field] = await Cart.promise().query(
      "select * from  cart where productId=? AND userId=?",
      [productId, req.user.id]
    );

    if (result.length == 0) {
      await Cart.promise().query(
        "INSERT INTO cart (productId ,userId,quantity) VALUES(?,?,?)",
        [productId, req.user.id, quantity]
      );
      return res.send("加入購物車");
    } else if (result.length > 0 && !isPurchase) {
      return res.send("購物車已經有該項物品");
    } else if (result.length > 0 && isPurchase) {
      await Cart.promise().query(
        "UPDATE cart SET quantity=quantity+? where id=?",
        [quantity, result[0].id]
      );
      return res.send("添加成功");
    }
  } catch (e) {
    return res.send("資料庫有問題");
  }
});
//購物車頁面
router.get("/cart", async (req, res) => {
  let [products, field] = await Cart.promise().query(
    `select c.id ,p.name,p.price,c.quantity ,p.imageUrl,u.username
    from  products p  left join cart c on c.productId=p.id
    left join user u on p.ownerId=u.id
    where c.userId=?`,
    [req.user.id]
  );

  return res.render("cart", { user: req.user, products });
});

//刪除購物車商品
router.delete("/cart/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Cart.promise().query("DELETE FROM cart WHERE id=?", [id]);

    return res.send("ok");
  } catch (e) {
    return res.send("刪除失敗");
  }
});
//更新訂單數量
router.patch("/cart/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    let result = await Cart.promise().query(
      "UPDATE cart SET quantity=? WHERE id=?",
      [quantity, id]
    );

    return res.send("ok");
  } catch (e) {
    return res.send("資料修改失敗");
  }
});

//下訂單頁面
router.get("/order", async (req, res) => {
  const { id } = req.query;
  const idArray = id.split(",");
  try {
    //製作出與id列表依樣多的?號並使用join合併成新字串
    const placeholders = idArray.map(() => "?").join(",");
    const [products, field] = await Cart.promise().query(
      `select c.id ,p.name,p.price,c.quantity ,p.imageUrl,u.username
      from  products p  left join cart c on c.productId=p.id
    left join user u on p.ownerId=u.id 
      where c.id in (${placeholders})`,
      idArray
    );
    //寄件地址
    let [address, fields] = await Address.promise().query(
      "select s.address from user u left join ShippingAddresses s on u.id=s.userid where u.id=? ",
      [req.user.id]
    );

    //總金額
    let amount = 0;

    req.session.cart = [];

    products.forEach((item) => {
      item.address = address[0].address;
      amount += item.price * item.quantity;
      req.session.cart.push(item);
    });

    return res.render("order", {
      user: req.user,
      products,
      address: address[0],
      amount,
    });
  } catch (e) {
    return res.send("資料庫發生錯誤");
  }
});
// 新增地址
router.post("/addAddress", async (req, res) => {
  const { realName, phone, address } = req.body;
  try {
    await User.promise().query(
      `UPDATE user 
      SET realName=? ,phone=?
      WHERE id=?`,
      [realName, phone, req.user.id]
    );
    await Address.promise().query(
      "INSERT INTO ShippingAddresses (userId ,address) VALUES(?,?)",
      [req.user.id, address]
    );

    return res.send("ok");
  } catch (e) {
    return res.send("資料庫發生錯誤");
  }
});

//修改地址
router.patch("/addAddress", async (req, res) => {
  const { realName, phone, address } = req.body;

  try {
    let u = await User.promise().query(
      `UPDATE user AS u
      JOIN ShippingAddresses AS s on u.id=s.userId 
      SET u.realName=? ,u.phone=?, s.address=?
      WHERE u.id=?`,
      [realName, phone, address, req.user.id]
    );

    return res.send("ok");
  } catch (e) {
    return res.send("資料庫發生錯誤");
  }
});
// 綠界
router.post("/pay", async (req, res) => {
  try {
    let { itemName, amount, paramValue } = req.body;
    paramValue = paramValue.substring(0, paramValue.length - 1);

    //20碼uid
    const uid = new ShortUniqueId({ length: 20 });
    const MerchantTradeNo = uid.rnd();
    const param = {
      MerchantID: process.env.MerchantID,
      MerchantTradeNo,
      MerchantTradeDate: `${moment().format("YYYY/MM/DD HH:mm:ss")}`,
      PaymentType: "aio",
      TotalAmount: amount,
      TradeDesc: "ecpaytest",
      ItemName: itemName,
      ReturnURL:
        "https://1453-2001-b011-5c09-5c36-fc49-5a69-e04d-f72a.ngrok-free.app/user/payResult",
      ChoosePayment: "ALL",
      EncryptType: 1,
      CustomField1: paramValue,
      ClientBackURL:
        "https://1453-2001-b011-5c09-5c36-fc49-5a69-e04d-f72a.ngrok-free.app",
    };

    const form = `
  <form action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="POST" name="payment" style="display: none;">
    <input name="MerchantID" value="${param.MerchantID}"/>
    <input name="MerchantTradeNo" value="${param.MerchantTradeNo}" />
    <input name="MerchantTradeDate" value="${param.MerchantTradeDate}" />
    <input name="PaymentType" value="${param.PaymentType}" />
    <input name="TotalAmount" value="${param.TotalAmount}" />
    <input name="TradeDesc" value="${param.TradeDesc}" />
    <input name="ItemName" value="${param.ItemName}" />
    <input name="ReturnURL" value="${param.ReturnURL}" />
    <input name="ChoosePayment" value="${param.ChoosePayment}" />
    <input name="EncryptType" value="${param.EncryptType}" />
    <input name="ClientBackURL" value="${param.ClientBackURL}" />
    <input name="CustomField1" value="${param.CustomField1}"/ >
    <input name="CheckMacValue" value="${generateCheckValue(param)}" />
    <button type="submit">Submit</button>
  </form>  `;

    return res.json({ status: "Success", data: form });
  } catch (e) {
    return res.status(500).json({
      status: "Error",
      message: e,
    });
  }
});
//綠界付款成功
router.post("/payResult", async (req, res) => {
  try {
    const { RtnCode, CustomField1 } = req.body;
    const placeholders = CustomField1.replace(/\d+/g, "?");
    const value = CustomField1.split(",");
    console.log(CustomField1, placeholders);
    if (RtnCode == 1) {
      pay(value, placeholders);
    }

    return res.send("ok");
  } catch (e) {
    return res.send(e);
  }
});
//貨到付款
router.post("/cod", async (req, res) => {
  try {
    let { paramValue } = req.body;

    paramValue = paramValue.substring(0, paramValue.length - 1);
    const placeholders = paramValue.replace(/\d+/g, "?");
    const value = paramValue.split(",");

    pay(value, placeholders);
    return res.send("ok");
  } catch (e) {
    console.log(e);
    return res.send(e);
  }
});

//生成checkValue
function generateCheckValue(params) {
  //轉成array
  const entries = Object.entries(params);
  //按照字母排序
  entries.sort((a, b) => {
    return a[0].localeCompare(b[0]);
  });
  // 參數最前面加上HashKey、最後面加上HashIV

  let result =
    `HashKey=${process.env.HashKey}&` +
    entries.map((x) => `${x[0]}=${x[1]}`).join("&") +
    `&HashIV=${process.env.HashIV}`;
  //encode URL 並轉換成小寫
  result = encodeURIComponent(result).toLowerCase();
  //以SHA256加密方式來產生雜凑值
  result = result
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%20/g, "+");
  // .replace(/%2c/g, ",");
  result = SHA256(result).toString();
  //轉成大寫
  return result.toUpperCase();
}

//付款後資料庫相關動作
async function pay(value, placeholders) {
  let [result, fieldss] = await Cart.promise().query(
    `select c.id as cartId ,p.id as productId ,u.id  as userId , p.price*c.quantity AS amount , s.address  
    from cart c left join products p on c.productId=p.id 
    left join user u on c.userId=u.id
    left join  ShippingAddresses s on c.userId=s.id
    where c.id in (${placeholders})`,
    value
  );
  result.forEach(async (item) => {
    await Orders.promise().query(
      "INSERT INTO orders (productId,userId,amount,address,status) VALUES(?,?,?,?,?)",
      [item.productId, item.userId, item.amount, item.address, "待出貨"]
    );
    await Products.promise().query(
      `UPDATE products SET sold=sold+(select quantity from cart where productId=? and userId=?)where id=? `,
      [item.productId, item.userId, item.productId]
    );
    //將已購買商品從購物車中移出
    await Cart.promise().query(`DELETE FROM cart WHERE id =?`, [item.cartId]);
  });
}

module.exports = router;
