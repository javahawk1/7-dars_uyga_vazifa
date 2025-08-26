const db = require("../config/db.config")

const createShop = (req, res) => {
    const { name, owner_id, phone_number, district_id, address, location } = req.body

    if (!name || !owner_id || !district_id || !address) {
        return res.status(400).json({
            message: "Name, owner_id, district_id, and address are required",
            error: "Bad Request"
        })
    }

    db.query(
        `INSERT INTO shop (name, owner_id, phone_number, district_id, address, location) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, owner_id, phone_number || null, district_id, address, location || null],
        (error, results) => {
            if (error) {
                console.log("Yangi shop qo'shishda xatolik", error)
                return res.status(500).json({
                    message: "Error adding new shop",
                    error: "Internal Server Error"
                })
            }
            res.status(201).json({
                message: "New shop added successfully",
                id: results.insertId,
                name: name
            })
        }
    )
}

const getAllShops = (req, res) => {
    db.query(`SELECT * FROM shop ORDER BY id`, (error, results) => {
        if (error) {
            console.log("Shoplarni olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving shops",
                error: "Internal Server Error"
            })
        }
        res.status(200).json({
            message: "Shops retrieved successfully",
            data: results
        })
    })
}

const getShopById = (req, res) => {
    const { id } = req.params

    db.query(`SELECT * FROM shop WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Shopni olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving shop",
                error: "Internal Server Error"
            })
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Shop not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "Shop retrieved successfully",
            data: results[0]
        })
    })
}

const updateShop = (req, res) => {
    const { id } = req.params
    const { name, owner_id, phone_number, district_id, address, location } = req.body

    db.query(
        `UPDATE shop SET name = ?, owner_id = ?, phone_number = ?, district_id = ?, address = ?, location = ? WHERE id = ?`,
        [name, owner_id, phone_number, district_id, address, location, id],
        (error, results) => {
            if (error) {
                console.log("Shopni yangilashda xatolik", error)
                return res.status(500).json({
                    message: "Error updating shop",
                    error: "Internal Server Error"
                })
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "Shop not found",
                    error: "Not Found"
                })
            }

            res.status(200).json({
                message: "Shop updated successfully",
                id: id
            })
        }
    )
}

const deleteShop = (req, res) => {
    const { id } = req.params

    db.query(`DELETE FROM shop WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Shopni o'chirishda xatolik", error)
            return res.status(500).json({
                message: "Error deleting shop",
                error: "Internal Server Error"
            })
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "Shop not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "Shop deleted successfully",
            id: id
        })
    })
}

module.exports = {
    createShop,
    getAllShops,
    getShopById,
    updateShop,
    deleteShop
}
