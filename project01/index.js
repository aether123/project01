//  npm install dotenv express mysql2 mongoose passport express-seesion connect-flash ejs express-session multer
// passport-google-oauth20  passport-jwt   passport-line   passport-facebook
const dotenv = require("dotenv");
dotenv.config();
require("./config/passport");
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth-router");
const sellerRoutes = require("./routes/seller-router");
const userRoutes = require("./routes/user-router");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");
const Products = require("./models/user-model");
const Cart = require("./models/user-model");
//設置multer的middleware
const upload = multer();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.any()); // 解析 multipart/form-data 請求
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use("/seller", sellerRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
//主頁初始化與搜尋商品
app.get("/", async (req, res) => {
  const { productName } = req.query;
  let items = 0;
  try {
    let query;
    let params = [];
    if (productName) {
      query = `select p.id, p.name , p.price ,p.imageUrl, u.username
      from products p left join user u on  p.ownerId=u.id
      where p.name LIKE ?`;
      params.push(`%${productName}%`);
    } else {
      query = `select p.id, p.name , p.price ,p.imageUrl, u.username
               from products p left join user u on  p.ownerId=u.id`;
    }
    let [products, field] = await Products.promise().query(query, params);

    if (req.user) {
      let [cart, _] = await Cart.promise().query(
        "select * from cart where userId=?",
        [req.user.id]
      );
      items = cart.length;
    }

    return res.render("index", { user: req.user, products, items });
  } catch (e) {
    return res.send("資料尋找失敗");
  }
});

app.listen("8080", () => {
  console.log("server running on port 8080");
});
