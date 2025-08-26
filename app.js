const express = require("express")
const app = express()

const cors = require("cors")
app.use(cors())
app.use(express.json())

require("dotenv").config()

const PORT = process.env.PORT ?? 3000

const index_routes = require("./routes/index.routes")

app.use("/api", index_routes)

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})