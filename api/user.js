const express = require('express');
const router = express.Router();
const validator = require("validator");
const config = require("../config/config")
var admin = require("firebase-admin");
var serviceAccount = require("../config/setime-e7775-firebase-adminsdk-3dys9-880f3b35dc.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://setime-e7775.firebaseio.com"
});
const db = admin.firestore();

validatePhone = phone => {
  var re = /(09|01|02|03|04|05|06|07|08)+([0-9]{8})\b/;
  return re.test(phone);
};

function validate(req, res, next) {
  if (!validatePhone(req.body.phone)) {
    res.json({
      status: false,
      message: "Check phone"
    })
  } else if (req.body.fullName == "") {
    res.json({
      status: false,
      message: "Name is not empty"
    })
  } else if (req.body.password == "") {
    res.json({
      status: false,
      message: "Phone is not empty"
    })
  } else next();
}
router.post("/signup", validate, function (req, res) {
  const users = db.collection("users");
  users.where("phone", "==", req.body.phone).get()
    .then(snapshot => {
      if (snapshot.empty) {
        db.collection("users").add({
          fullName: req.body.fullName,
          phone: req.body.phone,
          password: req.body.password,
          status: false
        })
          .then(result => {
            res.json({
              status: true,
              id: result.id
            })
          })
      } else {
        res.json({
          status: false,
          message: "Phone number already in use"
        })
      }
    })


})

router.get("/", function (req, res) {
  let citiesRef = db.collection('users');
  let query = citiesRef.where('email', '==', "victordev198@gmail.com").get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      }

      var arr = []
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        arr.push(doc.data());
      });
      console.log("Arr: ", arr)
      res.json({
        data: arr
      })

      // console.log("snapshot: ", snapshot)
      // res.json({
      //   data: snapshot
      // })
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
})

router.post("/", function (req, res) {
  db.collection('users').add({
    fulName: req.body.fullName,
    phone: req.body.phone,
    email: req.body.email,
    password: req.body.password
  }).then(ref => {
    console.log('Added document with ID: ', ref.id);
    res.json({
      status: true,
      id: ref.id
    })
  });
})

router.get("/signin", function (req, res) {
  let cityRef = db.collection('cities').doc('SF');
  let getDoc = cityRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        console.log('Document data:', doc.data());
        res.json({
          data: doc.data()
        })
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
})

module.exports = router;