const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const db = require("../middlewares/dbfirebase");
const config = require("../config/config");
const auth = require("../middlewares/authentication");
const { validateEmail, validatePhone } = require("../common/utils");


function validateSignup(req, res, next) {
  if (
    !validatePhone(req.body.phoneOrEmail) &&
    !validateEmail(req.body.phoneOrEmail)
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

router.post("/", auth, function (req, res, next) {
  res.json({
    data: "ok"
  });
});
router.post("/signin", function (req, res) {
  var acc = req.body.acc;
  console.log(acc);
  var phoneOrEmail = "";
  try {
    if (validatePhone(acc)) {
      phoneOrEmail = "isPhone";
    } else if (validateEmail(acc)) {
      phoneOrEmail = "isEmail";
    }
    const users = db.collection("users");
    if (phoneOrEmail != "") {
      users
        .where(phoneOrEmail == "isPhone" ? "phone" : "email", "==", acc)
        .get()
        .then(async snapshot => {
          if (!snapshot.empty) {
            var arr = [];
            snapshot.forEach(doc => {
              arr.push(doc.data());
            });
            var user = arr[0];

            const checkSignin = await bcrypt.compare(
              req.body.password,
              user.password
            );

            if (checkSignin) {
              var token = jwt.sign({ id: user.id }, config.SECRET, {
                expiresIn: "30 days"
              });
              return res.json({
                data: {
                  status: true,
                  token: token
                }
              });
            } else {
              return res.json({
                status: false,
                message: "password wrong"
              });
            }
          } else {
            return res.json({
              data: {
                status: false,
                message: "Email or phone number has not been registered"
              }
            });
          }
        });
    } else {
      return res.json({
        data: {
          status: false,
          error: "phone or email is invalid"
        }
      });
    }
  } catch (err) {
    return res.json({
      data: {
        status: false,
        error: err
      }
    });
  }
});

router.post("/activeAccount", async (req, res) => {
  try {
    var account = req.body.account;
    if (account) {
      var acc = await User.findById(req.body.userId);
      if (acc.phone == account || acc.email === account) {
        acc.accountStatus = "active";
        await acc.save();
        res.json({
          data: {
            status: true,
            message: "Active account success.",
          }
        })
      } else {
        res.json({
          data: {
            status: false,
            message: "Phone or email is not has been register."
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
      var password = await bcrypt.hash(req.body.phoneOrEmail, 10);
      var userRole = await Role.findOne({ name: "user" });
      const acc = new User({
        fullName: req.body.fullName,
        phone: validatePhone(req.body.phoneOrEmail) ? req.body.phoneOrEmail : "",
        email: validateEmail(req.body.phoneOrEmail) ? req.body.phoneOrEmail : "",
        password: password,
        role: userRole._id,
        accountStatus: "disable"
      });
      acc.save().then(result => {
        res.json({
          data: {
            status: true,
            message: "Signin success.",
            userId: result._id
          }
        })
      }).catch(err => {
        res.json({
          data: {
            status: false,
            error: err
          }
        })
      });
    }
  } catch (err) {

  }
});
module.exports = router;
