const router = require("express").Router()
const stockController = require("../controller/stockController")

router.get("/stock", stockController.getStockData)
router.get("/stock-history/:id", stockController.getStockHistory)
router.get("/getstockbycompany/:id", stockController.getStockCompanyItemWise)

module.exports = router