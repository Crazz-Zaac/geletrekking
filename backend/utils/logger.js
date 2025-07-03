// utils/logger.js
import winston from 'winston';
import path from 'path';

// Make sure log folder exists
const logDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: 'info', // default log level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // log as JSON format (easy to parse)
  ),
  transports: [
    // Save all logs (info, warn, error...) into combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
    // Save only errors into error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    // Optional: Show logs in terminal too
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
