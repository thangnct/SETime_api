const express = require("express");
const app = express();
// const mongoose = require("mongoose");
const config = require("./config/config")
const bodyParser = require('body-parser')
 const apiRouter = require("./api")

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use("/api", apiRouter)

app.listen(config.PORT, ()=>{
    console.log("API is running in port: ", config.PORT);
})
