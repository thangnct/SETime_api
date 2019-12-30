const express = require("express");
const app = express();
const mongoose = require("mongoose");
const config = require("./config")
const bodyParser = require('body-parser')
 const router = 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 


mongoose.connect('mongodb://localhost:27017/SETime', {useNewUrlParser: true});

app.listen(config.PORT, ()=>{
    console.log("API is running in port: ", config.PORT);
})
