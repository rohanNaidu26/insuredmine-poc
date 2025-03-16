import winston from 'winston'
import { asyncLocalStorage } from './asyncStorage.js'
import config from 'config'
import { v4 as uuidv4 } from 'uuid'

const logLevel = config.get('LOGGER.LOG_LEVEL')

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const store = asyncLocalStorage.getStore()
  const correlationId = store?.correlationId || uuidv4()

  return JSON.stringify({
    timestamp,
    level,
    correlationId,
    message,
    ...meta,
  })
})

// Create logger
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [new winston.transports.Console()],
})

export default logger
