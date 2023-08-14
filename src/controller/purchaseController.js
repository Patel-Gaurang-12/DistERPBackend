const purchaseModel = require("../models/purchaseSchema");
const stockController = require("./stockController")

module.exports.addPurchase = async (request, response) => {
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

    const res = await purchaseModel.create(data);
    await stockController.addToStock(data.items);
    response.status(200).json({
      message: "purchase added succesfully",
      data: res,
    });
  } catch (error) {
    response.status(500).json({
      message: "Error while adding purchase.",
      data: error,
    });
  }
};

module.exports.getPurchases = async (request, response) => {
  try {
    const res = await purchaseModel
      .find()
      .populate("vendorId")
      .populate("items.itemId")
      .populate("items.companyId")
      .exec();
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

module.exports.getBillNumber = (async (request, response) => {
  try {
    const res = await purchaseModel
      .find({ invoice: request.body.data });
    console.log(res);
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