const router = require("express").Router()
const stockController = require("../controller/stockController")

router.get("/stock",stockController.getStockData)

module.exports = router