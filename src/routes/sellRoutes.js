const router = require("express").Router()
const sellController = require("../controller/sellController")

router.post("/add-sell", sellController.addSell);
router.get("/get-sell", sellController.getSell);

module.exports = router