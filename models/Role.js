const mongoose = require("mongoose");

const ruleSchema = mongoose.Schema({
    name: String
})

module.exports = mongoose.model("Rule", ruleSchema);