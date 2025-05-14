import express from "express"
import connectDB from "./db/connection"
import dotenv from "dotenv"

import scanRoutes from "./routes/scan.routes"
import vulnRoutes from "./routes/vulns.routes"

const app = express()
const PORT = process.env.PORT || 3000

express.json()
dotenv.config()

app.use(express.urlencoded({ extended: true }))

app.use(scanRoutes)
app.use(vulnRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  connectDB()
})
