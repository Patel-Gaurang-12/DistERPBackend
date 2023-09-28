const sellModel = require("../models/sellSchema");
const stockController = require("./stockController");
const stockSchema = require("../models/stockSchema");
const histroySchema = require("../models/histroySchema");
const sellAmountHistorySchma = require("../models/sellHistorySchema");
const sellHistorySchema = require("../models/sellHistorySchema");
const sellSchema = require("../models/sellSchema");

module.exports.addSell = async (request, response) => {
    try {
        var data = request.body;
        const history = [];
        const stockData = await stockSchema.find({});
        data.items = data.items.map((item) => {
            delete item.id;
            const stock = stockData.find(stock => stock.companyId.toString() === item.companyId && stock.itemId.toString() === item.itemId)
            const data = {
                companyId: item.companyId,
                itemId: item.itemId,
                type: "sell",
                inQty: parseFloat(item.qty),
                currentQty: stock?.qty ? stock?.qty : 0,
                date: request.body?.date
            }
            history.push(data)
            return {
                companyId: item.companyId,
                qty: parseFloat(item.qty),
                price: parseFloat(item.price),
                itemId: item.itemId,
                uom: item.uom,
            };
        });
        // console.log("history ", history);
        data.total = data.items.reduce((accumulator, currentValue) => {
            return accumulator + (currentValue.price * currentValue.qty);
        }, 0)

        const res = await sellModel.create(data);
        await stockController.removeStocks(data.items)
        await histroySchema.insertMany(history)
        response.status(200).json({
            message: "sell added succesfully",
            data: res,
        });
    } catch (error) {
        // console.log("error : ", error);
        response.status(500).json({
            message: "Error while adding sell.",
            data: error,
        });
    }
};

module.exports.getSell = async (request, response) => {
    try {
        const res = await sellModel
            .find()
            .populate("clientId")
            .populate("items.itemId")
            .populate("items.companyId")
            .exec();
        // console.log("res for client", res);
        response.status(200).json({
            message: "Data retrived succesfully.",
            data: res,
        });
    } catch (error) {
        response.status(500).json({
            message: "Error while retriving data.",
            data: error,
        });
    }
};

module.exports.deleteSell = async (request, response) => {
    try {
        var sellbill;
        const res = await sellModel.find({ _id: request.params.id })
        if (res.length > 0) {
            const setResponse = await stockController.addToStock(res[0].items);
            if (setResponse === null || setResponse === undefined || setResponse.length === 0) {
                sellbill = await sellModel.findByIdAndDelete(request.params.id);
            }
            response.status(200).json({
                message: "Sell Bill Deleted successfully",
                data: setResponse
            })
        } else {
            response.status(404).json({
                message: "Error in delete sellbill",
                data: []
            })
        }
    } catch (error) {
        // console.log(error);
        response.status(500).json({
            message: "Error while deleting sellbill.",
            data: error
        })
    }
}
module.exports.datewisesellprice = async (request, response) => {
    try {
        var data = request.body;
        const datewiseprice = await sellModel.find({
            date: { $regex: data.date, $options: 'i' }
        }).populate("items.itemId")
            .populate("items.companyId")
            .exec();
        response.status(200).json({
            message: "sellbill price success",
            data: datewiseprice
        })
    } catch (error) {
        // console.log(error);
        response.status(500).json({
            message: "can't retrive sellbill price",
        })
    }
}

module.exports.datewisesellitem = async (request, response) => {
    try {
        var data = request.body;
        const datewiseprice = await sellModel.find({
            date: { $regex: data.date, $options: 'i' }
        })
            .populate('items.itemId')
            .populate('items.companyId')
            .exec();

        // Create a map to consolidate items by itemId
        const consolidatedItems = new Map();

        // Iterate through the datewiseprice data and consolidate items
        datewiseprice.forEach((sell) => {
            sell.items.forEach((item) => {
                const itemId = item.itemId._id.toString();
                // console.log("before 'if' ", item);
                if (consolidatedItems.has(itemId)) {
                    // Item already exists, update quantity and total
                    const existingItem = consolidatedItems.get(itemId);
                    existingItem.qty += item.qty;
                    existingItem.total += item.qty * item.price;
                } else {
                    // Item doesn't exist, add it to the map
                    consolidatedItems.set(itemId, {
                        itemId: item.itemId,
                        companyId: item.companyId,
                        price: item.price,
                        qty: item.qty,
                        total: item.qty * item.price,
                    });
                }
            });
        });

        // Convert the map values (consolidated items) to an array
        const consolidatedItemList = Array.from(consolidatedItems.values());

        response.status(200).json({
            message: 'sellbill price success',
            data: consolidatedItemList
        });

    } catch (error) {
        // console.log(error);
        response.status(500).json({
            message: "can't retrive sellbill price",
        })
    }
}
module.exports.updateDebitMony = async (request, response) => {
    try {
        const sells = await sellModel.find({ _id: request.body._Id }, {});
        const datas = sells[0].total - parseFloat(request.body.debitMoney);
        if (sells[0].total >= parseFloat(request.body.debitMoney)) {
            const resp = await sellModel.findOneAndUpdate({ _id: request.body._Id }, { $set: { total: datas } });

            const history = {
                type: request.body.type,
                amount: request.body.debitMoney,
                date: request.body.date,
                sellId: request.body._Id,
                receiptno: request.body.receiptno
            }
            await sellAmountHistorySchma.create(history);
            response.status(200).json({
                message: "Sell bill updated successfully.",
                data: resp
            })
        }
        else {
            response.status(500).json({
                message: "Invalid debit amount.",
                data: "Invalid debit amount."
            })
        }
    } catch (error) {
        // console.log(error);
        response.status(500).json({
            message: "Error while editing sellbill.",
            data: error
        })
    }
}

module.exports.getSellWisePriceHistory = (async (request, response) => {
    try {
        const res = await sellAmountHistorySchma
            .find()
        // .populate("sellId")
        // .exec();
        if (res.length !== 0) {
            response.status(200).json({
                message: "Data retrived succesfully.",
                data: res,
            });
        } else {
            response.status(500).json({
                message: "Error while retriving data.",
                data: "No empty data",
            });
        }
    } catch (error) {
        response.status(500).json({
            message: "Error while retriving data.",
            data: error,
        });
    }
})


module.exports.getsellBillNumber = (async (request, response) => {
    try {
        const res = await sellModel
            .find({ sellbillno: request.body.data });
        // console.log(res);
        if (res.length === 0) {
            response.status(200).json({
                message: "Data retrived succesfully.",
                data: true,
            });
        } else {
            response.status(200).json({
                message: "Data retrived succesfully.",
                data: false,
            });
        }
    } catch (error) {
        response.status(500).json({
            message: "Error while retriving data.",
            data: error,
        });
    }
})

module.exports.datewiseAddMoneyList = async (request, response) => {
    try {
        var data = request.body;
        // console.log("data-----", data);
        const datewiseprice = await sellHistorySchema.find({
            date: { $eq: data.date },
        }).populate({
            path: "sellId",
            populate: {
                path: "clientId",
                // model:"client"
            }
        }).exec()
        // console.log("sdnsjdh", datewiseprice);
        // console.log("data....132324134243", dataForSomething);
        response.status(200).json({
            message: "sellbill price success",
            data: datewiseprice
        })
    } catch (error) {
        // console.log(error);
        response.status(500).json({
            message: "can't retrive sellbill price",
        })
    }
}

module.exports.getRecordBetweenDate = (async (request, response) => {
    try {

        const date1 = new Date(request.body.date1);
        const date2 = new Date(request.body.date2);
        const data = await sellHistorySchema.find(
            {
                date: {
                    $gte: date1.toISOString(),
                    $lte: date2.toISOString()
                }
            }
        )

        const query = {
            paymentType: 0,
            date: {
                $gte: date1.toISOString(),
                $lte: date2.toISOString()
            }
        };

        const projection = {
            date: 1,
            items: {
                qty: 1,
                price: 1
            }
        };
        const sells = await sellModel.find(query, projection);
        // console.log("sellHistorySchemaData", data);
        // console.log("sellHistorySchemaData",sells);
        response.status(200).json({
            message: "data retrived success",
            data: { sells, data }
        })
    } catch (err) {
        response.status(500).json({
            message: "error retriving data",
            data: err
        })
    }
})