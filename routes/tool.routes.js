const {
    createTool,
    getAllTools,
    getToolById,
    updateTool,
    deleteTool
} = require("../controllers/tool.controller")

const router = require("express").Router()

router.post("/", createTool)
router.get("/", getAllTools)
router.get("/:id", getToolById)
router.put("/:id", updateTool)
router.delete("/:id", deleteTool)

module.exports = router