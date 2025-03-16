import logger from '../utils/logger.js'
import { AppError } from '../utils/errorHandler.js'
import { scheduleMessageInsertion } from '../services/schedulerService.js'

export const scheduleMessage = async (req, res, next) => {
  try {
    const { message, day, time } = req.body
    if (!message || !day || !time) {
      throw new AppError(400, 'Message, day, and time are required')
    }
    scheduleMessageInsertion({ message, day, time })
    logger.info({
      message: 'Message scheduled successfully',
      requestBody: req.body,
    })
    res.status(200).json({ success: true, message: 'Message scheduled successfully' })
  } catch (error) {
    next(error)
  }
}
