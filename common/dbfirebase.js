var admin = require("firebase-admin");
var serviceAccount = require("../config/setime-e7775-firebase-adminsdk-3dys9-880f3b35dc.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://setime-e7775.firebaseio.com"
});
const db = admin.firestore();

module.exports = db;