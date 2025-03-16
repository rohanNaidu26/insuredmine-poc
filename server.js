import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './src/config/dbConnection.js';
import apiRoutes from './src/routes/api.js';
import { monitorCPU } from './src/utils/cpuMonitor.js';
import { loadJobsFromFile, ensureFileExists, saveJobsToFile } from './src/services/schedulerService.js';
import logger from './src/utils/logger.js';
import errorHandler from './src/utils/errorHandler.js';
import correlationMiddleware from './src/config/correlationMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
await connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(correlationMiddleware);
app.use((req, res, next) => {
  logger.info({
    correlationId: req.correlationId,
    message: `Incoming request: ${req.method} ${req.url}`,
  });
  next();
});

ensureFileExists();
loadJobsFromFile();

process.on('exit', saveJobsToFile);
process.on('SIGINT', () => {
  saveJobsToFile();
  process.exit();
});

// API Routes
app.use('/api', apiRoutes);

app.use(errorHandler);
// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


monitorCPU();

export default server;
