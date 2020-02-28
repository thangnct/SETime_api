const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const db = require("../common/dbfirebase");
const config = require("../config/config");
const { userAuth, adminAuth, checkTokenFirebase } = require("../middlewares/authentication");
const { validateEmail, validatePhone } = require("../common/utils");
var admin = require("firebase-admin");

function validateSignup(req, res, next) {
  // console.log(req.body)
  if (
    !validatePhone(req.body.phoneOrEmail) && !validateEmail(req.body.phoneOrEmail)
  ) {
    res.json({
      status: false,
      message: "Check phone or email"
    });
  } else if (req.body.fullName == "") {
    res.json({
      status: false,
      message: "Name is not empty"
    });
  } else if (req.body.password == "") {
    res.json({
      status: false,
      message: "Password is not empty"
    });
  } else next();
}

router.post("/auth", adminAuth, function (req, res, next) {
  res.json({
    message: "next"
  })
});
router.post("/signin", async (req, res) => {
  try {
    const body = req.body;
    if (body.account && body.password) {
      const acc = await User.findOne({ $or: [{ phone: body.account }, { email: body.account }] });
      if (acc) {
        let checkPassword = await bcrypt.compare(body.password, acc.password)
        console.log(checkPassword);
        if (checkPassword) {
          let info = { userId: acc.id, role: acc.role, timePassChange: acc.timePassChange }
          let token = jwt.sign(info, config.SECRET, {
            expiresIn: "60 days"
          });
          res.json({
            data: {
              code: 1,
              token,
              message: "Login success."
            }
          })
        } else {
          res.json({
            data: {
              code: 0,
              message: "Password wrong."
            }
          })
        }
      } else {
        res.json({
          data: {
            code: -1,
            message: "Phone or email is not register."
          }
        })
      }
    } else {
      res.json({
        data: {
          code: -2,
          message: "You must enter account and password."
        }
      })
    }
  } catch (err) {
    console.log(err)
    res.json({
      data: {
        status: false,
        code: -99,
        error: err
      }
    })
  }

});

router.post("/activeAccount", async (req, res) => {
  try {
    var account = req.body.account;
    if (account) {
      var acc = await User.findById(req.body.userId);
      if (acc) {
        if (acc.phone == account || acc.email === account) {
          admin.auth().verifyIdToken(req.body.idToken)
            .then(async function (decodedToken) {
              let uid = decodedToken.uid;
              if (uid) {
                acc.accountStatus = "active";
                let result = await acc.save();
                if (result) {
                  res.json({
                    data: {
                      status: true,
                      message: "Active account success.",
                    }
                  })
                }
              }
            }).catch(async function (error) {
              let result = await acc.remove();
              if (result) {
                res.json({
                  data: {
                    status: false,
                    code: -1,
                    message: "Invalid token",
                    error: error
                  }
                })
              }
            });
        } else {
          res.json({
            data: {
              status: false,
              message: "Phone or email is not has been register"
            }
          })
        }
      }
      else {
        res.json({
          data: {
            status: false,
            message: "User is invalid."
          }
        })
      }
    } else {
      res.json({
        data: {
          status: false,
          message: "bad request"
        }
      })
    }
  } catch (err) {
    console.log(err)
    res.json({
      data: {
        status: false,
        error: err
      }
    })
  }

})
router.post("/signup", validateSignup, async function (req, res, next) {

  try {
    const checkExists = await User.findOne({ $or: [{ "phone": req.body.phoneOrEmail }, { "email": req.body.phoneOrEmail }] });
    if (checkExists) {
      res.json({
        data: {
          status: false,
          message: "Phone or email is has been used."
        }
      })
    } else {
      var password = await bcrypt.hash(req.body.password, 10);
      var userRole = await Role.findOne({ name: "user" });
      const acc = new User({
        fullName: req.body.fullName,
        phone: validatePhone(req.body.phoneOrEmail) ? req.body.phoneOrEmail : "",
        email: validateEmail(req.body.phoneOrEmail) ? req.body.phoneOrEmail : "",
        password: password,
        role: userRole._id,
        accountStatus: "disable",
        timePassChange: Date.now() / 1000 | 0
      });
      acc.save().then(result => {
        res.json({
          data: {
            code: 1,
            message: "Signup success.",
            userId: result._id
          }
        })
      }).catch(err => {
        res.json({
          data: {
            code: -99,
            error: err
          }
        })
      });
    }
  } catch (err) {
    console.log(err)
    res.json({ data: { code: -99, error: err } })
  }
});
module.exports = router;
