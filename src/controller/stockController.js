const stockModel = require("../models/stockSchema")

module.exports.addToStock = ((data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("stock data : ", data);

            for (let i = 0; i < data.length; i++) {
                const velidateResp = await stockModel.find({
                    $and: [
                        { "companyId": data[i].companyId },
                        { "itemId": data[i].itemId }
                    ]
                })
                if (velidateResp.length === 0 || velidateResp === null || velidateResp === {} || velidateResp === [] || velidateResp === undefined) {
                    console.log("velidate(if) : ", velidateResp);
                    var inserted = await stockModel.create(data[i])
                    console.log("inserted ", inserted);

                } else {
                    var price = velidateResp[0].price + parseFloat(data[i].price);
                    var qty = velidateResp[0].qty + parseFloat(data[i].qty);
                    var updated = await stockModel.findByIdAndUpdate({ _id: velidateResp[0]._id }, { price: price, qty: qty })
                    console.log("updated : ", updated);
                }
            }
        } catch (error) {
            console.log("error occured in adding stock : ", error);
            reject();
        }
    })
})

module.exports.getStockData = (async (request, response) => {
    try {
        const data = await stockModel.find()
            .populate("companyId").populate("itemId").exec();
        response.status(200).json({
            message: "data retrived successfully.",
            data: data
        })
    } catch (error) {
        response.status(500).json({
            message: "Error while retriving data.",
            data: error
        })
    }
})