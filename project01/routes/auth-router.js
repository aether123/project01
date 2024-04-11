const router = require("express").Router();
const passport = require("passport");
const accountSid = process.env.TWILIO_accountSid;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_verifySid;
const client = require("twilio")(accountSid, authToken);
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

router.get("/login", (req, res) => {
  return res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "帳號或密碼不正確",
  }),
  (req, res) => {
    return res.redirect("http://localhost:8080");
  }
);

router.get("/signup", (req, res) => {
  return res.render("register");
});

router.get("/signup/:page", (req, res) => {
  const phoneNumber = req.session.phoneNumber;
  const { page } = req.params;

  if (page == "otp" && phoneNumber) {
    return res.render("otp", { phoneNumber });
  } else if (page == "setpassword" && phoneNumber) {
    return res.render("setpassword");
  } else {
    return res.redirect("/auth/login");
  }
});

//簡訊認證
router.post("/signup/:page", async (req, res) => {
  const { page } = req.params;
  if (page == "otp") {
    const { phoneNumber } = req.body;
    req.session.phoneNumber = phoneNumber;
    try {
      client.verify.v2.services(verifySid).verifications.create({
        to: `+886${phoneNumber.substring(1)}`,
        channel: "sms",
      });

      return res.redirect("/auth/signup/otp");
    } catch (e) {
      res.status(400).send("錯誤");
    }
  } else if (page == "checkotp") {
    const { phoneNumber, validNumber } = req.body;
    client.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        to: `+886${phoneNumber.substring(1)}`,
        code: validNumber,
      })
      .then((verification_check) => {
        res.send({ status: verification_check.valid });
      })
      .catch((error) => {
        res.status(500).send("Internal Server Error");
      });
  } else if (page == "setpassword") {
    try {
      const phoneNumber = req.session.phoneNumber;
      const { username, email, password } = req.body;
      let hashedPassword = await bcrypt.hash(password, 12);
      let [result, _] = await User.promise().query(
        "select * from user where phone=? or email=?",
        [phoneNumber, email]
      );

      if (result.length > 0) {
        return res.status(400).send("手機或信箱已經被註冊請修改");
      }

      await User.promise().query(
        "INSERT INTO user(username,email,phone,password) VALUES (?,?,?,?)",
        [username, email, phoneNumber, hashedPassword]
      );
      delete req.session.phoneNumber;
      return res.redirect("/auth/login");
    } catch (e) {
      return res.status(400).send("儲存失敗");
    }
  }
});

router.get(
  "/line",
  passport.authenticate("line", {
    scope: ["profile"],
  })
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })
);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  return res.redirect("/");
});

router.get(
  "/facebook/redirect",
  passport.authenticate("facebook"),
  (req, res) => {
    return res.redirect("/");
  }
);
router.get("/line/redirect", passport.authenticate("line"), (req, res) => {
  return res.redirect("/");
});

router.get("/signout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});
module.exports = router;
