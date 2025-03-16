import logger from './logger.js'
import { asyncLocalStorage } from './asyncStorage.js'
import { v4 as uuidv4 } from 'uuid'



// Custom Error Class
export class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const store = asyncLocalStorage.getStore()
  const correlationId = store?.correlationId || uuidv4()

  // Standard error response
  const errorResponse = {
    correlationId,
    status: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    details: err.details || null,
  }

  logger.error({
    correlationId,
    message: err.message,
    status: errorResponse.status,
    details: err.details,
    stack: err.stack,
  })

  res.status(errorResponse.status).json(errorResponse)
}

export default errorHandler
