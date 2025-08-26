const db = require("../config/db.config")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const { totp } = require("otplib")

totp.options = {
    step: 300,
    digits: 6,
    window: 1
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const generateTOTP = () => totp.generate(process.env.OTP_SECRET)

const verifyTOTP = (token) => {
    try {
        return totp.check(token, process.env.OTP_SECRET)
    } catch (error) {
        console.log('TOTP verification error:', error)
        return false
    }
}

const sendTOTP = (email, otp, callback) => {
    transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Tasdiqlash Kodingiz',
        text: `Sizning tasdiqlash kodingiz: ${otp}. U 5 daqiqadan keyin o‘chib ketadi.`,
        html: `<p>Tasdiqlash kodi: <b>${otp}</b></p><p>Bu kod 5 daqiqa davomida amal qiladi.</p>`
    }, callback)
}

const createUser = (req, res) => {
    const { name, phone_number, email, password, role, address } = req.body

    if (!name || !phone_number || !email || !password) {
        return res.status(400).json({ message: "Name, phone number, email, and password are required" })
    }

    db.query(`SELECT id FROM user WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.log("Email check error:", err)
            return res.status(500).json({ message: "Error checking email" })
        }

        if (results.length > 0) {
            return res.status(409).json({ message: "Email already exists" })
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.log("Hashing error:", err)
                return res.status(500).json({ message: "Error hashing password" })
            }

            const totpToken = generateTOTP()
            // Foydalanuvchi email tasdiqlanmaguncha is_active = false
            db.query(
                `INSERT INTO user (name, phone_number, email, password, role, address, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, phone_number, email, hashedPassword, role || 'user', address || null, false],
                (err, result) => {
                    if (err) {
                        console.log("User creation error:", err)
                        return res.status(500).json({ message: "Error creating user" })
                    }

                    sendTOTP(email, totpToken, (err) => {
                        if (err) {
                            console.log("Email sending error:", err)
                            // Agar email yuborilmasa → userni o‘chirib tashlaymiz
                            db.query(`DELETE FROM user WHERE id = ?`, [result.insertId])
                            return res.status(500).json({ message: "Failed to send verification code" })
                        }

                        res.status(200).json({
                            message: "Verification code sent to email",
                            email,
                            requires_verification: true,
                            user_id: result.insertId
                        })
                    })
                }
            )
        })
    })
}



const verifyTOTPAndCreateUser = (req, res) => {
    const { email, token, user_id } = req.body
    if (!email || !token || !user_id) {
        return res.status(400).json({ message: "Email, verification code and user ID are required" })
    }

    db.query(`SELECT * FROM user WHERE id = ? AND email = ? AND is_active = false`, [user_id, email], (err, results) => {
        if (err) {
            console.log("User retrieval error:", err)
            return res.status(500).json({ message: "Error retrieving verification data" })
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "User not found or already active" })
        }

        if (!verifyTOTP(token)) {
            return res.status(400).json({ message: "Invalid verification code" })
        }

        db.query(`UPDATE user SET is_active = true WHERE id = ?`, [user_id], (err) => {
            if (err) {
                console.log("User activation error:", err)
                return res.status(500).json({ message: "Error activating user" })
            }

            res.status(200).json({
                message: "User verified and activated successfully",
                id: user_id,
                email
            })
        })
    })
}



// resendTOTP funksiyasini quyidagicha o'zgartiring:
const resendTOTP = (req, res) => {
    const { email, user_id } = req.body;
    if (!email || !user_id) return res.status(400).json({ message: "Email and user ID are required" });

    db.query(`SELECT * FROM user WHERE id = ? AND email = ? AND is_active = false`, [user_id, email], (err, results) => {
        if (err) {
            console.log("User retrieval error:", err);
            return res.status(500).json({ message: "Error retrieving verification data" });
        }

        if (results.length === 0) return res.status(400).json({ message: "User not found or already active" });

        const newToken = generateTOTP();
        
        sendTOTP(email, newToken, (err) => {
            if (err) {
                console.log("Resend email error:", err);
                return res.status(500).json({ message: "Failed to resend verification code" });
            }

            res.status(200).json({ message: "New verification code sent", email });
        });
    });
}


const loginUser = (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" })

    db.query(`SELECT * FROM user WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.log("Login error:", err)
            return res.status(500).json({ message: "Error during login" })
        }

        if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" })

        const user = results[0]
        bcrypt.compare(password, user.password, (err, isValid) => {
            if (err) {
                console.log("Password comparison error:", err)
                return res.status(500).json({ message: "Error during login" })
            }

            if (!isValid) return res.status(401).json({ message: "Invalid email or password" })
            if (!user.is_active) return res.status(401).json({ message: "Account not activated" })

            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' })

            res.status(200).json({
                message: "Login successful",
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            })
        })
    })
}

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: "Access token required" })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
        req.user = decoded
        next()
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" })
    }
}

const getUserById = (req, res) => {
    const { id } = req.params

    db.query(`SELECT * FROM user WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Foydalanuvchini olishda xatolik", error)
            return res.status(500).json({
                message: "Error retrieving user",
                error: "Internal Server Error"
            })
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "User retrieved successfully",
            data: results[0]
        })
    })
}

const updateUser = (req, res) => {
    const { id } = req.params
    const { name, phone_number, email, password, role, address, is_active } = req.body

    db.query(
        `UPDATE user SET name = ?, phone_number = ?, email = ?, password = ?, role = ?, address = ?, is_active = ? WHERE id = ?`,
        [name, phone_number, email, password, role, address, is_active, id],
        (error, results) => {
            if (error) {
                console.log("Foydalanuvchini yangilashda xatolik", error)
                return res.status(500).json({
                    message: "Error updating user",
                    error: "Internal Server Error"
                })
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found",
                    error: "Not Found"
                })
            }

            res.status(200).json({
                message: "User updated successfully",
                id: id
            })
        }
    )
}

const deleteUser = (req, res) => {
    const { id } = req.params

    db.query(`DELETE FROM user WHERE id = ?`, [id], (error, results) => {
        if (error) {
            console.log("Foydalanuvchini o'chirishda xatolik", error)
            return res.status(500).json({
                message: "Error deleting user",
                error: "Internal Server Error"
            })
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found",
                error: "Not Found"
            })
        }

        res.status(200).json({
            message: "User deleted successfully",
            id: id
        })
    })
}

module.exports = {
    createUser,
    loginUser,
    verifyTOTPAndCreateUser,
    resendTOTP,
    verifyToken,
    getUserById,
    updateUser,
    deleteUser
};
