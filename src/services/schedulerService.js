import fs from 'fs'
import path from 'path'
import Message from '../models/Message.js'
import logger from '../utils/logger.js'

const SCHEDULE_FILE = path.join(process.cwd(), 'scheduled_jobs.json')
const scheduledMessages = new Map() 

// 🔹 Ensure JSON File Exists
export const ensureFileExists = () => {
  if (!fs.existsSync(SCHEDULE_FILE)) {
    logger.debug({message: 'scheduled_jobs.json file created.'})
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify([])) 
  }
}

// 🔹 Function to Schedule Message
export const scheduleMessageInsertion = async ({ message, day, time }, saveToFile = true) => {
  const scheduledAt = new Date(`${day}T${time}:00`)
  const now = new Date()
  // If the message was due in the past (missed due to a restart), insert it immediately
  if (scheduledAt <= now) {
    try {
      await Message.create({ message, scheduledAt })
      logger.info({message: "processing pastDue Message", details: message})
    } catch (error) {
      logger.warn({message: "Error processing pastDue Message", details: error})
    }
    return
  }

  // Otherwise, schedule for future execution
  const delay = scheduledAt.getTime() - now.getTime()
  const timeoutId = setTimeout(async () => {
    try {
      await Message.create({ message, scheduledAt })
      logger.info({message: "Scheduled message inserted:", details: message})
      scheduledMessages.delete(timeoutId)
    } catch (error) {
      logger.warn({message: "Error processing Message", details: error})
    }
  }, delay)

  // Store job in memory
  const jobData = { message, day, time, timeoutId }
  scheduledMessages.set(timeoutId, jobData)
  logger.info({message: `Message scheduled at ${scheduledAt}`})
}

// 🔹 Save Jobs to File Before Exit
export const saveJobsToFile = () => {
  const jobs = [...scheduledMessages.values()].map(({ timeoutId, ...job }) => job)
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(jobs, null, 2))
}

// 🔹 Load Jobs from File on Restart & Process Missed Messages
export const loadJobsFromFile = () => {
  ensureFileExists()
  const jobs = JSON.parse(fs.readFileSync(SCHEDULE_FILE))

  jobs.forEach(job => scheduleMessageInsertion(job, false)) 

  fs.unlinkSync(SCHEDULE_FILE) 
  logger.info({message: "Jobs reloaded from file and file deleted."})
}

