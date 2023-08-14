const { request } = require("express");
const sellModel = require("../models/sellSchema");
const stockController = require("./stockController")

module.exports.addSell = async (request, response) => {
    try {
        var data = request.body;
        data.items = data.items.map((item) => {
            delete item.id;
            return {
                companyId: item.companyId,
                qty: parseFloat(item.qty),
                price: parseFloat(item.price),
                itemId: item.itemId,
                uom: item.uom,
            };
        });

        console.log(" ---> ", data);
        const res = await sellModel.create(data);
        await stockController.removeStocks(data.items)
        response.status(200).json({
            message: "sell added succesfully",
            data: res,
        });
    } catch (error) {
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
        response.status(200).json({
            message: "Data retrived succesfully.",
            data: res,
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: "Error while retriving data.",
            data: error,
        });
    }
};

module.exports.deleteSell = async (request, response) => {
    try {
        const sellbill = await sellModel.findByIdAndDelete(request.params.id);
        response.status(200).json({
            message: "Sell Bill Deleted successfully",
            data: sellbill
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
        console.log("---> ", data)
        const datewiseprice = await sellModel.find({
            date: { $regex: data.date, $options: 'i' }
        })
        console.log("eeeee --> ", datewiseprice);
        response.status(200).json({
            message: "sellbill price success",
            data: datewiseprice
        })
    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: "can't retrive sellbill price",
            data: error
        })
    }
}