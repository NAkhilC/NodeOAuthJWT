const axios = require("axios");
const clientID = "d4a71878b1b51173574f";
const clientSecret = "3394828042bf029bbda9bddcec3a7b4af39c8e31";
// index.js

/*  EXPRESS */
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const { session } = require("passport/lib");
app.use(cookieParser());

app.set("view engine", "ejs");
var access_token = "";

app.get("/login", function (req, res) {
  res.render("index", { client_id: clientID });
});

const port = 6000;

// Declare the callback route
app.get("/github/callback", (req, res) => {
  // The req.query object has the query params that were sent to this route.
  const requestToken = req.query.code;
  let token;
  axios({
    method: "post",
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
      accept: "application/json",
    },
  }).then((response) => {
    token = jwt.sign(
      { access_token: response.data.access_token, clientID: clientID },
      "secretkeyappearshere",
      { expiresIn: "10s" }
    );
    res.cookie("appgithubtoken", token, { maxAge: 10000, httpOnly: true });
    access_token = response.data.access_token;
    res.redirect("/success");
  });
});

app.get("/testing", function (req, res) {
  const info = async () => {
    return await axios({
      method: "get",
      url: `https://api.github.com/user`,
      headers: {
        Authorization: "token " + access_token,
      },
    });
  };
  info()
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
});

app.get("/success", function (req, res) {
  axios({
    method: "get",
    url: `https://api.github.com/user`,
    headers: {
      Authorization: "token " + access_token,
    },
  })
    .then((response) => {
      try {
        const token = req.cookies["c035d7f38676d3f9388178730d691997"];
        if (token) {
          const decodedToken = jwt.verify(token, "secretkeyappearshere");
          console.log(decodedToken);
          if (decodedToken.access_token) {
            res.render("success", {
              userData: response.data,
            });
          } else {
            res.render("fail", { fail: "Your verification failed" });
          }
        } else {
          res.render("fail", { fail: "Your token has been expired" });
        }
      } catch (err) {}
    })
    .catch((reject) => {
      res.render("fail", { fail: "Authentication failed" });
    });
});

app.listen("2500", () => {
  console.log("Server is listening on port 2500");
});
