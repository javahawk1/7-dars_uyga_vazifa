const db = require("../config/db.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createAdmin = (req, res) => {
    const { full_name, email, password, phone_number, is_active, is_creator } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({
            message: "full_name, email, and password are required",
            error: "Bad Request"
        });
    }

    db.query(`SELECT id FROM admin WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.log("Email tekshirishda xatolik:", err);
            return res.status(500).json({ message: "Email tekshirishda xatolik" });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: "Email allaqachon mavjud" });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.log("Parol hash-lashda xatolik:", err);
                return res.status(500).json({ message: "Parol hash-lashda xatolik" });
            }

            db.query(
                `INSERT INTO admin (full_name, email, password, phone_number, is_active, is_creator) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [full_name, email, hashedPassword, phone_number || null, is_active || true, is_creator || false],
                (err, result) => {
                    if (err) {
                        console.log("Admin yaratishda xatolik:", err);
                        return res.status(500).json({ message: "Admin yaratishda xatolik" });
                    }

                    res.status(201).json({
                        message: "Admin muvaffaqiyatli yaratildi",
                        id: result.insertId,
                        full_name,
                        email
                    });
                }
            );
        });
    });
};

const loginAdmin = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email va parol talab qilinadi" });
    }

    db.query(`SELECT * FROM admin WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.log("Login xatosi:", err);
            return res.status(500).json({ message: "Login paytida xatolik" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Noto'g'ri email yoki parol" });
        }

        const admin = results[0];
        if (!admin.is_active) {
            return res.status(401).json({ message: "Admin hisobi faol emas" });
        }

        bcrypt.compare(password, admin.password, (err, isValid) => {
            if (err) {
                console.log("Parol solishtirish xatosi:", err);
                return res.status(500).json({ message: "Login paytida xatolik" });
            }

            if (!isValid) {
                return res.status(401).json({ message: "Noto'g'ri email yoki parol" });
            }

            const token = jwt.sign(
                { id: admin.id, email: admin.email, is_creator: admin.is_creator }, 
                process.env.JWT_SECRET || 'secret', 
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: "Login muvaffaqiyatli",
                token,
                admin: { 
                    id: admin.id, 
                    full_name: admin.full_name, 
                    email: admin.email, 
                    is_creator: admin.is_creator 
                }
            });
        });
    });
};

const getAllAdmins = (req, res) => {
    db.query(`SELECT id, full_name, email, phone_number, is_active, is_creator FROM admin ORDER BY id`, (error, results) => {
        if (error) {
            console.log("Adminlarni olishda xatolik", error);
            return res.status(500).json({
                message: "Adminlarni olishda xatolik",
                error: "Internal Server Error"
            });
        }
        res.status(200).json({
            message: "Adminlar muvaffaqiyatli olindi",
            data: results
        });
    });
};

const getAdminById = (req, res) => {
    const { id } = req.params;

    db.query(`SELECT id, full_name, email, phone_number, is_active, is_creator FROM admin WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Adminni olishda xatolik", error);
            return res.status(500).json({
                message: "Adminni olishda xatolik",
                error: "Internal Server Error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Admin topilmadi",
                error: "Not Found"
            });
        }

        res.status(200).json({
            message: "Admin muvaffaqiyatli olindi",
            data: results[0]
        });
    });
};

const updateAdmin = (req, res) => {
    const { id } = req.params;
    const { full_name, email, phone_number, is_active, is_creator } = req.body;

    db.query(
        `UPDATE admin SET full_name = ?, email = ?, phone_number = ?, is_active = ?, is_creator = ? WHERE id = ?`,
        [full_name, email, phone_number, is_active, is_creator, id],
        (error, results) => {
            if (error) {
                console.log("Adminni yangilashda xatolik", error);
                return res.status(500).json({
                    message: "Adminni yangilashda xatolik",
                    error: "Internal Server Error"
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "Admin topilmadi",
                    error: "Not Found"
                });
            }

            res.status(200).json({
                message: "Admin muvaffaqiyatli yangilandi",
                id: id
            });
        }
    );
};

const deleteAdmin = (req, res) => {
    const { id } = req.params;

    db.query(`DELETE FROM admin WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Adminni o'chirishda xatolik", error);
            return res.status(500).json({
                message: "Adminni o'chirishda xatolik",
                error: "Internal Server Error"
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "Admin topilmadi",
                error: "Not Found"
            });
        }

        res.status(200).json({
            message: "Admin muvaffaqiyatli o'chirildi",
            id: id
        });
    });
};

module.exports = {
    createAdmin,
    loginAdmin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
};