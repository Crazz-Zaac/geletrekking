// cron/deleteLogs.js
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const logDir = path.join(process.cwd(), 'logs');
const logFiles = ['combined.log', 'error.log'];

// ⏰ Schedule: Every Sunday at 00:00
cron.schedule('0 0 * * 0', () => {
  logFiles.forEach(file => {
    const filePath = path.join(logDir, file);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error(`❌ Failed to delete ${file}:`, err.message);
      } else if (!err) {
        console.log(`🧹 Deleted log file: ${file}`);
      }
    });
  });
});

console.log('🕒 Cron job for WEEKLY log cleanup scheduled.');
