const mongoose = require("mongoose")

const purchaseSchema = new mongoose.Schema({
    date: {
        type: Date,
        require: true,
        message : "date is require"
    },
    invoice: {
        type: String,
        require: true,
        unique: true,
        message : "invoice is require",
        match: /^[a-zA-Z0-9-]+$/
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vendor"
    },
    remark: {
        type: String,
        require: true
    },
    items: [
        {
            companyId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "company"
            },
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "companyWiseItem"
            },
            price: {
                type: Number,
                require: true,
                message : "price is require"
            },
            qty: {
                type: Number,
                require: true,
                message : "qty is require"
            },
            uom: {
                type: String,
                require: true,
                message : "Unit of mesurment is require"
            },
        }
    ]
})

module.exports = mongoose.model("purchase", purchaseSchema)