// pages/api/testlog.js

import logger from '../../../backend/utils/logger'; // adjust path if needed

export default function handler(req, res) {
  // Log a normal info message
  logger.info('Test log from /api/testlog', {
    method: req.method,
    userAgent: req.headers['user-agent'],
  });

  // Log a fake error for testing
  logger.error('This is a fake error for testing purposes', {
    errorCode: 500,
    route: '/api/testlog',
  });

  // Send back a confirmation response
  res.status(200).json({ message: 'Test logs were written successfully!' });
}
