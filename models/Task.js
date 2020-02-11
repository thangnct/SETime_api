const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    goalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal"
    },
    taskTitle: String,
    taskStatus: String, //working_on - completed - out_of_date - pendig
    priorityLevel: Number,
    timeBound: String,
    location: String,
    notification: Number,
    note: String,
    //reasonDone: String 
},{timestamps: true});

module.exports = mongoose.model("Task", taskSchema);