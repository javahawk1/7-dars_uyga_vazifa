const db = require("../config/db.config")

// CREATE - Yangi district qo'shish
const createDistrict = (req, res) => {
    const { name } = req.body

    if (!name) {
        return res.status(400).json({
            message: "District name is required",
            error: "Bad Request"
        })
    }

    db.query(
        `INSERT INTO district (name) VALUES (?)`,
        [name],
        (error, results) => {
            if (error) {
                console.log("Yangi district qo'shishda xatolik", error)
                return res.status(500).json({
                    message: "Error adding new district",
                    error: "Internal Server Error"
                })
            }
            res.status(201).json({
                message: "New district added successfully",
                id: results.insertId,
                name: name
            })
        }
    )
}

// READ - Barcha districtlarni olish
const getAllDistricts = (req, res) => {
    db.query(`SELECT * FROM district ORDER BY name`, (error, results) => {
        if (error) {
            console.log("Districtlarni olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving districts",
                error: "Internal Server Error"
            })
        }
        res.status(200).json({
            message: "Districts retrieved successfully",
            data: results
        })
    })
}

// READ - ID bo'yicha district olish
const getDistrictById = (req, res) => {
    const { id } = req.params

    db.query(`SELECT * FROM district WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Districtni olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving district",
                error: "Internal Server Error"
            })
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "District not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "District retrieved successfully",
            data: results[0]
        })
    })
}

// UPDATE - Districtni yangilash
const updateDistrict = (req, res) => {
    const { id } = req.params
    const { name } = req.body

    if (!name) {
        return res.status(400).json({
            message: "District name is required",
            error: "Bad Request"
        })
    }

    db.query(
        `UPDATE district SET name = ? WHERE id = ?`,
        [name, id],
        (error, results) => {
            if (error) {
                console.log("Districtni yangilashda xatolik", error)
                return res.status(500).json({
                    message: "Error updating district",
                    error: "Internal Server Error"
                })
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "District not found",
                    error: "Not Found"
                })
            }

            res.status(200).json({
                message: "District updated successfully",
                id: id,
                name: name
            })
        }
    )
}

// DELETE - Districtni o'chirish
const deleteDistrict = (req, res) => {
    const { id } = req.params

    db.query(`DELETE FROM district WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Districtni o'chirishda xatolik", error)
            return res.status(500).json({
                message: "Error deleting district",
                error: "Internal Server Error"
            })
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "District not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "District deleted successfully",
            id: id
        })
    })
}

module.exports = {
    createDistrict,
    getAllDistricts,
    getDistrictById,
    updateDistrict,
    deleteDistrict
}
