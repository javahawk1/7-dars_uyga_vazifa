const {
    createAdmin,
    loginAdmin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
} = require("../controllers/admin.controller");

const { verifyToken } = require("../controllers/user.controller");

const router = require("express").Router();

router.post("/", createAdmin);
router.post("/login", loginAdmin);
router.get("/", verifyToken, getAllAdmins);
router.get("/:id", verifyToken, getAdminById);
router.put("/:id", verifyToken, updateAdmin);
router.delete("/:id", verifyToken, deleteAdmin);

module.exports = router;