const express = require('express');
const router = express.Router();

router.use("/user", require("./user"))
router.use("/note", require("./notes"))

module.exports = router;