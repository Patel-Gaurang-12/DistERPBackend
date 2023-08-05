const router = require("express").Router()
const purchaseController = require("../controller/purchaseController")

router.post("/add-purchase", purchaseController.addPurchase);
router.get("/get-purchase", purchaseController.getPurchases);

module.exports = router