const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    goalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal",
        required: true
    },
    taskTitle: {
        type: String,
        required: true
    },
    taskStatus: {
        type: String,
        required: true
    },
    timeBound: {
        isAllDay: Boolean,
        startTime: String,
        endTime: String,
    },
    color: String,
    // location: String,
    // notification: Number,
    note: String,
    //reasonDone: String 
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);