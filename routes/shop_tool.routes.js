const {
    createShopTool,
    getAllShopTools,
    getShopToolById,
    updateShopTool,
    deleteShopTool
} = require("../controllers/shop_tool.controller")

const router = require("express").Router()

router.post("/", createShopTool)
router.get("/", getAllShopTools)
router.get("/:id", getShopToolById)
router.put("/:id", updateShopTool)
router.delete("/:id", deleteShopTool)

module.exports = router