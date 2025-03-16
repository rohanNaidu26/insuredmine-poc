import { processCSVFile } from '../services/csvService.js'
import logger from '../utils/logger.js'
import { AppError } from '../utils/errorHandler.js'

export const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No file to upload, refer API documentation.')
    }
    // Trigger CSV processing in a worker thread
    processCSVFile(req.file.path)
      .then(() => {
        logger.info({
          message: 'Message scheduled successfully',
          requestBody: req.body,
        })
        res.status(200).json({ message: 'File processing initiated successfully' })
      })
      .catch((err) => {
        next(err)
      })
  } catch (error) {
    next(error)
  }
}
