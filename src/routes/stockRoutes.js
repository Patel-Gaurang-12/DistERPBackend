const router = require("express").Router()
const stockController = require("../controller/stockController")

router.get("/stock",stockController.getStockData)
router.get("/purchasestock/:id",stockController.addItemWisePurchaseStock)
router.get("/sellstock/:id",stockController.addItemWiseSellStock)

module.exports = router