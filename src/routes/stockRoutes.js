const router = require("express").Router()
const stockController = require("../controller/stockController")

router.get("/stock", stockController.getStockData)
router.get("/stock-history/:id", stockController.getStockHistory)

module.exports = router