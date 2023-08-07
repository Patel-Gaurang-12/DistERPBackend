const sellModel = require("../models/sellSchema");

module.exports.addSell = async (request, response) => {
    try {
        var data = request.body;
        console.log("data  wit", data);
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