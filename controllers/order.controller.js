const db = require("../config/db.config")

const getShopsWithTool = (req, res) => {
    const { tool_id } = req.params;

    if (!tool_id) {
        return res.status(400).json({
            message: "tool_id talab qilinadi",
            error: "Bad Request"
        });
    }

    db.query(`
        SELECT s.id, s.name, s.phone_number, s.address, d.name as district_name, st.rent_price
        FROM shop_tool st
        JOIN shop s ON st.shop_id = s.id
        JOIN district d ON s.district_id = d.id
        WHERE st.tool_id = ?
        ORDER BY st.rent_price ASC
    `, [tool_id], (error, results) => {
        if (error) {
            console.log("Jihoz magazinlarini olishda xatolik", error);
            return res.status(500).json({
                message: "Jihoz magazinlarini olishda xatolik",
                error: "Internal Server Error"
            });
        }
        res.status(200).json({
            message: "Jihoz magazinlari muvaffaqiyatli olindi",
            data: results
        });
    });
};

const getClientsWithCheapTools = (req, res) => {
    db.query(`
        SELECT u.id, u.name, u.email, u.phone_number, 
               t.name as tool_name, st.rent_price, co.order_date, co.period
        FROM client_order co
        JOIN user u ON co.client_id = u.id
        JOIN shop_tool st ON co.shop_tool_id = st.id
        JOIN tool t ON st.tool_id = t.id
        WHERE st.rent_price <= 100000
        ORDER BY st.rent_price ASC
    `, (error, results) => {
        if (error) {
            console.log("Arzon jihozli clientlarni olishda xatolik", error);
            return res.status(500).json({
                message: "Arzon jihozli clientlarni olishda xatolik",
                error: "Internal Server Error"
            });
        }
        res.status(200).json({
            message: "Arzon jihozli clientlar muvaffaqiyatli olindi",
            data: results
        });
    });
};

const getUsersRentedToolInDistrict = (req, res) => {
    const { district_id, tool_id, start_date, end_date } = req.body;

    if (!district_id || !tool_id || !start_date || !end_date) {
        return res.status(400).json({
            message: "district_id, tool_id, start_date, va end_date talab qilinadi",
            error: "Bad Request"
        });
    }
    db.query(`
        SELECT u.id, u.name, u.email, u.phone_number, 
               s.name as shop_name, t.name as tool_name,
               co.order_date, co.period, co.total_price
        FROM client_order co
        JOIN user u ON co.client_id = u.id
        JOIN shop_tool st ON co.shop_tool_id = st.id
        JOIN tool t ON st.tool_id = t.id
        JOIN shop s ON st.shop_id = s.id
        WHERE s.district_id = ? 
          AND st.tool_id = ?
          AND co.order_date BETWEEN ? AND ?
        ORDER BY co.order_date DESC
    `, [district_id, tool_id, start_date, end_date], (error, results) => {
        if (error) {
            console.log("Foydalanuvchilarni olishda xatolik", error);
            return res.status(500).json({
                message: "Foydalanuvchilarni olishda xatolik",
                error: "Internal Server Error"
            });
        }
        res.status(200).json({
            message: "Foydalanuvchilar muvaffaqiyatli olindi",
            data: results
        });
    });
};


const createClientOrder = (req, res) => {
    const { client_id, shop_tool_id, order_date, period, total_price } = req.body
    if (!client_id || !shop_tool_id || !order_date || !period) {
        return res.status(400).json({
            message: "client_id, shop_tool_id, order_date, and period are required",
            error: "Bad Request"
        })
    }

    db.query(
        `INSERT INTO client_order (client_id, shop_tool_id, order_date, period, total_price) 
         VALUES (?, ?, ?, ?, ?)`,
        [client_id, shop_tool_id, order_date, period, total_price || 0],
        (error, results) => {
            if (error) {
                console.log("Yangi client order qo'shishda xatolik", error)
                return res.status(500).json({
                    message: "Error adding new client order",
                    error: "Internal Server Error"
                })
            }
            res.status(201).json({
                message: "New client order added successfully",
                id: results.insertId
            })
        }
    )
}

const getAllClientOrders = (req, res) => {
    db.query(`SELECT * FROM client_order ORDER BY id`, (error, results) => {
        if (error) {
            console.log("Client orderlarni olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving client orders",
                error: "Internal Server Error"
            })
        }
        res.status(200).json({
            message: "Client orders retrieved successfully",
            data: results
        })
    })
}

const getClientOrderById = (req, res) => {
    const { id } = req.params

    db.query(`SELECT * FROM client_order WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Client orderni olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving client order",
                error: "Internal Server Error"
            })
        }
        if (results.length === 0) {
            return res.status(404).json({
                message: "Client order not found",
                error: "Not Found"
            })
        }
        res.status(200).json({
            message: "Client order retrieved successfully",
            data: results[0]
        })
    })
}

const updateClientOrder = (req, res) => {
    const { id } = req.params
    const { client_id, shop_tool_id, order_date, period, total_price } = req.body

    db.query(
        `UPDATE client_order SET client_id = ?, shop_tool_id = ?, order_date = ?, period = ?, total_price = ? WHERE id = ?`,
        [client_id, shop_tool_id, order_date, period, total_price, id],
        (error, results) => {
            if (error) {
                console.log("Client orderni yangilashda xatolik", error)
                return res.status(500).json({
                    message: "Error updating client order",
                    error: "Internal Server Error"
                })
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "Client order not found",
                    error: "Not Found"
                })
            }
            res.status(200).json({
                message: "Client order updated successfully",
                id: id
            })
        }
    )
}

const deleteClientOrder = (req, res) => {
    const { id } = req.params

    db.query(`DELETE FROM client_order WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Client orderni o'chirishda xatolik", error)
            return res.status(500).json({
                message: "Error deleting client order",
                error: "Internal Server Error"
            })
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "Client order not found",
                error: "Not Found"
            })
        }
        res.status(200).json({
            message: "Client order deleted successfully",
            id: id
        })
    })
}

module.exports = {
    createClientOrder,
    getAllClientOrders,
    getClientOrderById,
    updateClientOrder,
    deleteClientOrder,
    getShopsWithTool,         
    getClientsWithCheapTools, 
    getUsersRentedToolInDistrict 
};