const express = require("express")
const cors = require("cors")
const app = express()

// dot env config and database config
require("dotenv").config()
require("./config/dbConfig").dbConnect() 

// enable statements
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

// users routes 
const clientRouters = require("./routes/clientRoutes")
app.use("/distributer/api/v1/public/client", clientRouters);

//vendor routes
const vendorRouters = require("./routes/vendorRoutes")
app.use("/distributer/api/v1/public/vendor", vendorRouters)

// company routes
const companyRouters = require("./routes/comapnyRoutes");
app.use("/distributer/api/v1/public/company", companyRouters)

// item routers
const itemsRouters = require("./routes/companyWiseItemRouters"); 
app.use("/distributer/api/v1/public/item", itemsRouters)

// Purchase routers
const purchaseRouters = require("./routes/purchaseRoutes");
app.use("/distributer/api/v1/public/purchase", purchaseRouters)

app.listen(process.env.PORT, () => {
    console.log("server listern on port number : ", process.env.PORT)
})