const {
    createUser,
    loginUser,
    verifyTOTPAndCreateUser,
    resendTOTP,
    verifyToken,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/user.controller")

const router = require("express").Router()

router.post("/", createUser)
router.get("/:id", verifyToken, getUserById)
router.put("/:id", verifyToken, updateUser)
router.delete("/:id", verifyToken, deleteUser)

router.post("/verify", verifyTOTPAndCreateUser)
router.post("/resend", resendTOTP)

router.post("/login", loginUser)

module.exports = router
