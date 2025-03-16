import pidusage from 'pidusage';
import config from 'config';
import logger from './logger.js';

const { HEALTH_CHECK_INTERVAL, MAX_CPU_USE_THRESHOLD } = config.get('HEALTH');

let cpuHistory = [];

export const monitorCPU = () => {
  setInterval(async () => {
    try {
      const stats = await pidusage(process.pid);
      const cpuUsage = stats.cpu; 

      cpuHistory.push(cpuUsage);
      if (cpuHistory.length > 5) cpuHistory.shift();

      const avgCpuUsage = cpuHistory.reduce((a, b) => a + b, 0) / cpuHistory.length;
      
      logger.info({ message: `CPU Usage: ${avgCpuUsage.toFixed(2)}%` });

      if (avgCpuUsage > MAX_CPU_USE_THRESHOLD) {
        logger.warn({ message: `CPU usage above ${MAX_CPU_USE_THRESHOLD}% for sustained period. Restarting server...` });
        process.exit(1); 
      }
    } catch (error) {
      logger.error({ message: 'Error fetching CPU usage', error });
    }
  }, HEALTH_CHECK_INTERVAL);
};
