const mongoose = require("mongoose");

const historySchema=new mongoose.Schema({
    date: {
        type: String,
        require: true,
        message : "date is require"
    },
    Type:{
       type: String,
       require: true,
       message: "type is require"
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company"
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "companyWiseItem"
    },
    qty: {
        type: Number,
        require: true,
        message : "qty is require"

    },
    remainingStock: {
        type: Number,
        require: true,
        message : "remaining stock is required"
    }
})

module.exports = mongoose.model("history", historySchema)