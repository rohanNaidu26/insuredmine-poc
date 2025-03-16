import { Worker } from 'worker_threads'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import logger from '../utils/logger.js'
import { AppError } from '../utils/errorHandler.js'

export const processCSVFile = ( filePath) => {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const worker = new Worker(path.join(__dirname, '../workers/csvWorker.js'), {
      workerData: { filePath }
    })

    worker.on('message', (msg) => {
      logger.info({
        message: msg,
        filePath
      })
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err)
    })
    })

    worker.on('error', (err) => {
      console.error('Worker error:', err)
      throw AppError(400, err)
    })

    worker.on('exit', (code) => {
      if (code !== 0) {
        throw AppError(400, `Worker stopped with exit code ${code}`)
      } else {
        resolve()
      }
    })
  })
}
