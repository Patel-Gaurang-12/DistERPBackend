const router = require("express").Router()
const sellController = require("../controller/sellController")

router.post("/add-sell", sellController.addSell);
router.get("/get-sell", sellController.getSell);
router.delete("/deletesell/:id",sellController.deleteSell)
router.put("/datewisesellprice",sellController.datewisesellprice)


module.exports = router