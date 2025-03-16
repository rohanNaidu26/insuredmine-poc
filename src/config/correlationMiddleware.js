import { asyncLocalStorage } from '../utils/asyncStorage.js'
import { v4 as uuidv4 } from 'uuid'

const correlationMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4()

  asyncLocalStorage.run({ correlationId }, () => {
    res.setHeader('X-Correlation-ID', correlationId)
    next()
  })
}

export default correlationMiddleware
