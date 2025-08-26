const {
    createShop,
    getAllShops,
    getShopById,
    updateShop,
    deleteShop
} = require("../controllers/shop.controller")

const router = require("express").Router()

router.post("/", createShop)
router.get("/", getAllShops)
router.get("/:id", getShopById)
router.put("/:id", updateShop)
router.delete("/:id", deleteShop)

module.exports = router