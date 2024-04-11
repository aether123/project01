const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LineStrategy = require("passport-line").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

passport.serializeUser(async (user, done) => {
  done(null, user[0].id);
});
passport.deserializeUser(async (id, done) => {
  let [foundUser, field] = await User.promise().query(
    "select * from user where id=?",
    [id]
  );
  done(null, foundUser[0]);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let [foundUser, field] = await User.promise().query(
          "select * from user where apiId=?",
          [profile.id]
        );
        if (foundUser.length > 0) {
          console.log("已經註冊過");
          done(null, foundUser);
        } else {
          console.log("找到新用戶");
          let [insertUser, insertfield] = await User.promise().query(
            "INSERT INTO user (username ,email,photo,apiId) VALUES(?,?,?,?)",
            [
              profile.displayName,
              profile.emails[0].value,
              profile.photos[0].value,
              profile.id,
            ]
          );
          let [newUser, fields] = await User.promise().query(
            "SELECT * FROM user WHERE apiId= ? ",
            [profile.id]
          );
          done(null, newUser);
        }
      } catch (e) {
        done(e, null);
      }
    }
  )
);

//fb
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:8080/auth/facebook/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
    }
  )
);

passport.use(
  new LineStrategy(
    {
      channelID: process.env.LINE_CHANNEL_ID,
      channelSecret: process.env.LINE_CHANNEL_SECRET,
      callbackURL: "http://localhost:8080/auth/line/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let [foundUser, field] = await User.promise().query(
          "select * from user where apiId=?",
          [profile.id]
        );
        if (foundUser.length > 0) {
          console.log("已經註冊過");
          done(null, foundUser);
        } else {
          console.log("找到新用戶");
          let [insertUser, field] = await User.promise().query(
            "INSERT INTO user (username ,photo,apiId) VALUES(?,?,?)",
            [profile.displayName, profile.pictureUrl, profile.id]
          );
          let [newUser, fields] = await User.promise().query(
            "SELECT * FROM user WHERE apiId=?",
            [profile.id]
          );
          done(null, newUser);
        }
      } catch (e) {
        done(e, null);
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    let [foundUser, field] = await User.promise().query(
      "select * from user where phone=? or email=?",
      [username, username]
    );

    if (foundUser.length > 0) {
      let result = await bcrypt.compare(password, foundUser[0].password);
      if (result) {
        done(null, foundUser);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);
