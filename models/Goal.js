const mongoose = require("mongoose");

const goalSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    goalTitle: String,
    exprirationDate: String,
    color: String,
    describe: String,
    reward: String,
    goalStatus: String, ////working_on - completed - out_of_date - pendig
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }]
}, { timestamps: true });

module.exports = mongoose.model("Goal", goalSchema);