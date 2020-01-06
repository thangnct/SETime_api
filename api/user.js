const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../middlewares/dbfirebase");
const config = require("../config/config");
const auth = require("../middlewares/authentication");
// Get the `FieldValue` object
// let FieldValue = require("firebase-admin").firestore.FieldValue;

validatePhone = phone => {
  var re = /^\d{10}$/;
  return re.test(phone);
};
validateEmail = email => {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};
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

router.post("/", auth, function(req, res, next) {
  res.json({
    data: "ok"
  });
});
router.post("/signin", function(req, res) {
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
router.post("/signup", validateSignup, async function(req, res, next) {
  try {
    const users = db.collection("users");
    if (validatePhone(req.body.phoneOrEmail)) {
      users
        .where("phone", "==", req.body.phoneOrEmail)
        .get()
        .then(async snapshot => {
          if (!snapshot.empty) {
            res.json({
              data: {
                status: false,
                message: "Phone number is already in use"
              }
            });
          } else {
            const password = await bcrypt.hash(req.body.password, 10);
            db.collection("users")
              .add({
                fullName: req.body.fullName,
                phone: validatePhone(req.body.phoneOrEmail)
                  ? req.body.phoneOrEmail
                  : null,
                password: password,
                email: validateEmail(req.body.phoneOrEmail)
                  ? req.body.phoneOrEmail
                  : null,
                status: false
              })
              .then(result => {
                db.collection("users")
                  .doc(result.id)
                  .update({
                    id: result.id
                  })
                  .then(updateIdStatus => {
                    return res.json({
                      data: {
                        status: true,
                        id: result.id
                      }
                    });
                  });
              });
          }
        })
        .catch(err => {
          return res.json({
            data: {
              status: false,
              err: err
            }
          });
        });
    } else if (validateEmail(req.body.phoneOrEmail)) {
      users
        .where("email", "==", req.body.phoneOrEmail)
        .get()
        .then(async snapshot => {
          if (!snapshot.empty) {
            res.json({
              data: {
                status: false,
                message: "Email is already in use"
              }
            });
          } else {
            const password = await bcrypt.hash(req.body.password, 10);
            db.collection("users")
              .add({
                fullName: req.body.fullName,
                phone: validatePhone(req.body.phoneOrEmail)
                  ? req.body.phoneOrEmail
                  : null,
                password: password,
                email: validateEmail(req.body.phoneOrEmail)
                  ? req.body.phoneOrEmail
                  : null,
                status: false
              })
              .then(result => {
                db.collection("users")
                  .doc(result.id)
                  .update({ id: result.id })
                  .then(updateIdStatus => {
                    return res.json({
                      data: {
                        status: true,
                        id: result.id
                      }
                    });
                  });
              });
          }
        });
    }
  } catch (err) {
    return res.json({
      status: false,
      error: err
    });
  }
});
module.exports = router;
