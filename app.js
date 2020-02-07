const express = require("express");
const app = express();
const config = require("./config/config")
const bodyParser = require('body-parser')
const apiRouter = require("./api")
var mongoose = require('mongoose');


mongoose.connect(config.db, err => {
    if (err) {
        console.log("Can not connect to db: ", err);
    } else {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use("/api", apiRouter)

        app.listen(config.PORT, () => {
            console.log("API is running in port: ", config.PORT);
        })
    }
})





