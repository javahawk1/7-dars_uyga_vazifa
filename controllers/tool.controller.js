const db = require("../config/db.config")

const createTool = (req, res) => {
    const { name, brand, description, tool_price } = req.body

    if (!name || !brand || !description) {
        return res.status(400).json({
            message: "name, brand, and description are required",
            error: "Bad Request"
        })
    }

    db.query(
        `INSERT INTO tool (name, brand, description, tool_price) VALUES (?, ?, ?, ?)`,
        [name, brand, description, tool_price || 0],
        (error, results) => {
            if (error) {
                console.log("Yangi tool qo'shishda xatolik", error)
                return res.status(500).json({
                    message: "Error adding new tool",
                    error: "Internal Server Error"
                })
            }
            res.status(201).json({
                message: "New tool added successfully",
                id: results.insertId
            })
        }
    )
}

const getAllTools = (req, res) => {
    db.query(`SELECT * FROM tool ORDER BY id`, (error, results) => {
        if (error) {
            console.log("Tool yozuvlarini olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving tools",
                error: "Internal Server Error"
            })
        }
        res.status(200).json({
            message: "Tools retrieved successfully",
            data: results
        })
    })
}

const getToolById = (req, res) => {
    const { id } = req.params

    db.query(`SELECT * FROM tool WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Toolni olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving tool",
                error: "Internal Server Error"
            })
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Tool not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "Tool retrieved successfully",
            data: results[0]
        })
    })
}

const updateTool = (req, res) => {
    const { id } = req.params
    const { name, brand, description, tool_price } = req.body

    db.query(
        `UPDATE tool SET name = ?, brand = ?, description = ?, tool_price = ? WHERE id = ?`,
        [name, brand, description, tool_price, id],
        (error, results) => {
            if (error) {
                console.log("Toolni yangilashda xatolik", error)
                return res.status(500).json({
                    message: "Error updating tool",
                    error: "Internal Server Error"
                })
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "Tool not found",
                    error: "Not Found"
                })
            }

            res.status(200).json({
                message: "Tool updated successfully",
                id: id
            })
        }
    )
}

const deleteTool = (req, res) => {
    const { id } = req.params

    db.query(`DELETE FROM tool WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Toolni o'chirishda xatolik", error)
            return res.status(500).json({
                message: "Error deleting tool",
                error: "Internal Server Error"
            })
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "Tool not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "Tool deleted successfully",
            id: id
        })
    })
}

module.exports = {
    createTool,
    getAllTools,
    getToolById,
    updateTool,
    deleteTool
}
