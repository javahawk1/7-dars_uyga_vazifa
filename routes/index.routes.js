const router = require("express").Router();

const users = require("./user.routes");
const districts = require("./district.routes");
const orders = require("./order.routes");
const shops = require("./shop.routes");
const shopTools = require("./shop_tool.routes");
const tools = require("./tool.routes");
const admins = require("./admin.routes"); 

router.use("/users", users);
router.use("/districts", districts);
router.use("/orders", orders);
router.use("/shops", shops);
router.use("/shop-tools", shopTools);
router.use("/tools", tools);
router.use("/admins", admins);

module.exports = router;