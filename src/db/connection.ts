import mongoose from "mongoose"

const connectDB = async (): Promise<void> => {
  // Choose Mongo URI based on environment
  const isProd = process.env.NODE_ENV === "production"
  const mongoURI = isProd
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI_LOCAL

  try {
    console.log(process.env.MONGO_URI_LOCAL)
    const conn = await mongoose.connect(mongoURI || "")
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  }
}

export default connectDB
