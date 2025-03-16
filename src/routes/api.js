import express from 'express'
import multer from 'multer'
import { uploadCSV } from '../controllers/csvController.js'
import { getPolicyByUsername, getAggregatedPolicies } from '../controllers/policyController.js'
import { scheduleMessage } from '../controllers/schedulerController.js'
import { singleUploadConfig } from '../config/multerConfig.js'

const router = express.Router()



// CSV Upload Endpoint
router.post('/upload', singleUploadConfig, uploadCSV)

// Search policy info by username
router.get('/policy', getPolicyByUsername)

// Aggregated policies by user
router.get('/policies/aggregate', getAggregatedPolicies)

// Schedule a message insertion
router.post('/schedule/message', scheduleMessage)

export default router
