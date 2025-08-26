const {
    createDistrict,
    getAllDistricts,
    getDistrictById,
    updateDistrict,
    deleteDistrict
} = require("../controllers/district.controller")

const router = require("express").Router()

router.post("/", createDistrict)
router.get("/", getAllDistricts)
router.get("/:id", getDistrictById)
router.put("/:id", updateDistrict)
router.delete("/:id", deleteDistrict)

module.exports = router