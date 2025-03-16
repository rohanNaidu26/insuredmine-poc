import mongoose from 'mongoose'
import logger from '../utils/logger.js'
import config from "config"

const { RECONNECTION_TIME, MAX_POOL_SIZE } = config.get("DB")
mongoose.set('strictQuery', false)

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: MAX_POOL_SIZE,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    logger.info({ message: 'MongoDB connected successfully' })

    mongoose.connection.on('disconnected', () => {
      logger.warn({ message: 'MongoDB disconnected. Reconnecting...' })
      setTimeout(connectDB, RECONNECTION_TIME)
    })

    mongoose.connection.on('error', (error) => {
      logger.error({ message: 'MongoDB connection error', error })
    })

  } catch (error) {
    logger.error({ message: 'MongoDB connection failed', error })
    process.exit(1)
  }
}
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  logger.info({ message: 'MongoDB connection closed due to application termination' })
  process.exit(0)
})
