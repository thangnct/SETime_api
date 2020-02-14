const jwt = require("jsonwebtoken");
const config = require("../config/config");
const dbfirebase = require("../common/dbfirebase");
var admin = require("firebase-admin");
const User = require("../models/User");
const Role = require("../models/Role");

userAuth = async (req, res, next) => {
  try {
    // const token = req.headers["x-access-token"];
    const token = req.body.token;
    if (token) {
      jwt.verify(token, config.SECRET, async (err, decode) => {
        if (err) {
          res.json({
            data: {
              code: 0,
              message: "Access denied."
            }
          })
        } else {
          let userId = decode.userId;
          let acc = await User.findById(userId);
          if (acc) {
            if (acc.timePassChange == decode.timePassChange && acc.accountStatus == "active") {
              next();
            } else {
              res.json({
                data: {
                  code: 0,
                  message: "Access denied."
                }
              })
            }
          } else {
            res.json({ data: { code: 0, message: "Access denied." } })
          }
        }
      })
    } else {
      return res.json({
        data: {
          status: false,
          message: "Access denied."
        }
      });
    }
  } catch (err) {
    res.json({
      data: {
        code: -99,
        error: err
      }
    })
  }
};

adminAuth = async (req, res, next) => {
  try {
    // const token = req.headers["x-access-token"];
    const token = req.body.token;
    if (token) {
      jwt.verify(token, config.SECRET, async (err, decode) => {
        if (err) {
          res.json({
            data: {
              code: 0,
              message: "Access denied."
            }
          })
        } else {
          let userId = decode.userId;
          let acc = await User.findById(userId);
          if (acc) {
            let checkAdmin = await Role.findOne({ name: "admin" });
            console.log(acc.timePassChange, decode.timePassChange, checkAdmin._id, decode.role)
            if (acc.timePassChange == decode.timePassChange && checkAdmin._id == decode.role) {
              next();
            } else {
              res.json({
                data: {
                  code: 0,
                  message: "Access denied."
                }
              })
            }
          }
        }
      })
    } else {
      return res.json({
        data: {
          status: false,
          message: "Access denied."
        }
      });
    }
  } catch (err) {
    res.json({
      data: {
        code: -99,
        error: err
      }
    })
  }
}
checkTokenFirebase = (req, res, next) => {
  try {
    const idToken = req.body.idToken;
    if (idToken) {
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          let uid = decodedToken.uid;
          if (uid) {
            // res.json({
            //   uid
            // })
            next();
          } else {
            res.json({
              data: {
                status: false,
                code: -2,
                error: "Invalid token."
              }
            })
          }
        }).catch(function (error) {
          res.json({
            data: {
              status: false,
              error: error,
              message: "Token is invalid."
            }
          })
        });
    } else {
      res.json({
        data: {
          status: false,
          code: -1,
          error: "Bad request."
        }
      })
    }
  } catch (err) {
    res.json({
      data: {
        status: false,
        code: -99,
        error: err
      }
    })
  }

}
module.exports = {
  userAuth: userAuth,
  checkTokenFirebase: checkTokenFirebase,
  adminAuth: adminAuth
}