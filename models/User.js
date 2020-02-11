const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    fullName: String,
    phone: String,
    email: String,
    password: String,
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    accountStatus: String, //active - disable
    goals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal"
    }],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }],
    timePassChange: Number
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);