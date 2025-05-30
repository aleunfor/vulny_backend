import express from "express"
import connectDB from "./db/connection"
import dotenv from "dotenv"
import cors from "cors"

import { clerkMiddleware } from "@clerk/express"

import scanRoutes from "./routes/scan.routes"
import vulnRoutes from "./routes/vulns.routes"

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
dotenv.config()

app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use(clerkMiddleware())

app.use(scanRoutes)
app.use(vulnRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  connectDB()
})
