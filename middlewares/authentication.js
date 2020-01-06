const jwt = require("jsonwebtoken");
const config = require("../config/config");
const dbfirebase = require("./dbfirebase");
module.exports = auth = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (token) {
    jwt.verify(token, config.SECRET, function(err, decoded) {
      if (err) {
        return res.json({
          data: {
            status: false,
            err: err
          }
        });
      } else {
        dbfirebase
          .collection("users")
          .where("id", "==", decoded.id)
          .get()
          .then(snapshot => {
            if (!snapshot.empty) {
              next();
            } else {
              return res.json({
                data: {
                  status: false,
                  message: "Authentication failed."
                }
              });
            }
          });
      }
    });
  } else {
    return res.json({
      data: {
        status: false,
        message: "token is empty"
      }
    });
  }
};
