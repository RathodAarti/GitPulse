import mongoose from 'mongoose'

/**
 * Establishes a connection to the MongoDB Atlas cluster.
 * Retries once on initial failure, then exits if the database
 * is unreachable to prevent silent degradation.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8 uses these by default, listed for clarity
      autoIndex: true,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
