const purchaseModel = require("../models/purchaseSchema");
const stockController = require("./stockController")
const stockSchema = require("../models/stockSchema");
module.exports.addPurchase = async (request, response) => {
  try {
    var data = request.body;
    data.items = data.items.map((item) => {
      delete item.id;
      return {
        companyId: item.companyId,
        qty: parseFloat(item.qty),
        price: parseFloat(item.price),
        gstper: parseFloat(item.gstper), 
        itemId: item.itemId,
        uom: item.uom,
      };
    });
    
    var purchaseData=[];
    purchaseData=data;
    console.log("purchaseData",purchaseData);

    const res = await purchaseModel.create(data);
    await stockController.addToStock(data.items);
    var id = request.params.id;
     const stockQty=stockSchema.find({"_id":id})
     console.log("stockqty",stockQty)
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

// data.items.map((e)=>{
  // fetch quantity of that item in stock and get the quantity
  // schemaName.find({"itemId":e.itemId},qty).exec()
  // add all the dta that you recieve in the history table with this quantity
// })
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