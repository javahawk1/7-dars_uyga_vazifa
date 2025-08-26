const {
    createClientOrder,
    getAllClientOrders,
    getClientOrderById,
    updateClientOrder,
    deleteClientOrder,
    getShopsWithTool,
    getClientsWithCheapTools,
    getUsersRentedToolInDistrict
} = require("../controllers/order.controller");

const router = require("express").Router();

router.post("/", createClientOrder);
router.get("/", getAllClientOrders);
router.get("/:id", getClientOrderById);
router.put("/:id", updateClientOrder);
router.delete("/:id", deleteClientOrder);

router.get("/tool-shops/:tool_id", getShopsWithTool);
router.get("/clients/cheap-tools", getClientsWithCheapTools);
router.post("/users-rented-tool", getUsersRentedToolInDistrict);

module.exports = router;