const mongoose = require("mongoose")

module.exports.dbConnect = () => {
    mongoose.connect(process.env.MONGO_URI)
        .then(data => {
            console.log("db connected");
        })
        .catch(err => {
            console.log("db not connected");
        })
}