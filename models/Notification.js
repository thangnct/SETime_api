const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // category: String,
    title: String,
    content: String,
    img: String
});

module.exports = mongoose.model("Notification", notificationSchema);