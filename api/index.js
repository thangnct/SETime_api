const express = require('express');
const router = express.Router();

router.use("/user", require("./user"))
router.use("/goal", require("./goal"))
router.use("/setup", require("./setup"))

module.exports = router;