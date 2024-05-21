require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');

const mongo = "mongodb+srv://harishbhalaa:harish@patinet-otp.4qakehr.mongodb.net/";
mongoose.connect(mongo).then( () => {
    console.log("DB connected");
    app.listen(7000, () => {
        console.log("Server is listening on port 7000");
    })
}).catch(err => console.log(err));

app.use('/api', userRoute);