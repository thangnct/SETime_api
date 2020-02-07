const express = require('express');
const router = express.Router();

router.use("/user", require("./user"))
router.use("/note", require("./notes"))
router.use("/setup", require("./setup"))

module.exports = router;