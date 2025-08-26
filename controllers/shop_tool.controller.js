const db = require("../config/db.config")

const createShopTool = (req, res) => {
    const { shop_id, tool_id, rent_price } = req.body

    if (!shop_id || !tool_id) {
        return res.status(400).json({
            message: "shop_id and tool_id are required",
            error: "Bad Request"
        })
    }

    db.query(
        `INSERT INTO shop_tool (shop_id, tool_id, rent_price) VALUES (?, ?, ?)`,
        [shop_id, tool_id, rent_price || 0],
        (error, results) => {
            if (error) {
                console.log("Yangi shop_tool qo'shishda xatolik", error)
                return res.status(500).json({
                    message: "Error adding new shop_tool",
                    error: "Internal Server Error"
                })
            }
            res.status(201).json({
                message: "New shop_tool added successfully",
                id: results.insertId
            })
        }
    )
}


const getAllShopTools = (req, res) => {
    db.query(`SELECT * FROM shop_tool ORDER BY id`, (error, results) => {
        if (error) {
            console.log("Shop_tool yozuvlarini olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving shop_tools",
                error: "Internal Server Error"
            })
        }
        res.status(200).json({
            message: "Shop_tools retrieved successfully",
            data: results
        })
    })
}

const getShopToolById = (req, res) => {
    const { id } = req.params

    db.query(`SELECT * FROM shop_tool WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Shop_tool yozuvini olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving shop_tool",
                error: "Internal Server Error"
            })
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Shop_tool not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "Shop_tool retrieved successfully",
            data: results[0]
        })
    })
}

const updateShopTool = (req, res) => {
    const { id } = req.params
    const { shop_id, tool_id, rent_price } = req.body

    db.query(
        `UPDATE shop_tool SET shop_id = ?, tool_id = ?, rent_price = ? WHERE id = ?`,
        [shop_id, tool_id, rent_price, id],
        (error, results) => {
            if (error) {
                console.log("Shop_toolni yangilashda xatolik", error)
                return res.status(500).json({
                    message: "Error updating shop_tool",
                    error: "Internal Server Error"
                })
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "Shop_tool not found",
                    error: "Not Found"
                })
            }

            res.status(200).json({
                message: "Shop_tool updated successfully",
                id: id
            })
        }
    )
}

const deleteShopTool = (req, res) => {
    const { id } = req.params

    db.query(`DELETE FROM shop_tool WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Shop_toolni o'chirishda xatolik", error)
            return res.status(500).json({
                message: "Error deleting shop_tool",
                error: "Internal Server Error"
            })
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "Shop_tool not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "Shop_tool deleted successfully",
            id: id
        })
    })
}

module.exports = {
    createShopTool,
    getAllShopTools,
    getShopToolById,
    updateShopTool,
    deleteShopTool
}
