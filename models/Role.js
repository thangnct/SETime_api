const mongoose = require("mongoose");

const ruleSchema = mongoose.Schema({
    name: String
},{timestamps: true})

module.exports = mongoose.model("Rule", ruleSchema);