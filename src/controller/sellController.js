const { request } = require("express");
const sellModel = require("../models/sellSchema");
const stockController = require("./stockController");
const stockSchema = require("../models/stockSchema");
const histroySchema = require("../models/histroySchema");

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
        console.log("history ", history);
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
        console.log("error : ", error);
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
        console.log("res for client", res);
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
        const setResponse = await stockController.addToStock(res[0].items);
        if (setResponse === null || setResponse === {} || setResponse === [] || setResponse === undefined || setResponse.length === 0) {
            sellbill = await sellModel.findByIdAndDelete(request.params.id);
        }
        response.status(200).json({
            message: "Sell Bill Deleted successfully",
            data: setResponse
        })
    } catch (error) {
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
        console.log("data....", datewiseprice);
        response.status(200).json({
            message: "sellbill price success",
            data: datewiseprice
        })
    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: "can't retrive sellbill price",
        })
    }
}
module.exports.updateDebitMony = async (request, response) => {
    try {
        const sells = await sellModel.find({ _id: request.body._Id }, {});
        const datas = sells[0].total - parseFloat(request.body.price);
        if (sells[0].total >= request.body.price) {
            const resp = await sellModel.findOneAndUpdate({ _id: request.body._Id }, { $set: { total: datas } });
            response.status(200).json({
                message: "Sell bill updated successfully.",
                data: resp
            })
        }
        else {
            throw new Error("Invalid price....")
        }
    } catch (error) {
        response.status(500).json({
            message: "Error while deleting sellbill.",
            data: error
        })
    }
}