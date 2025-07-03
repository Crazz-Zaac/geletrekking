const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const logDir = path.join(process.cwd(), 'logs');
const logFiles = ['combined.log', 'error.log'];

// Cron expression (change this)
const cronExpression = '0 0 * * 0'; // Weekly on Sunday at 00:00

// 🔍 Auto-interpret expression to label
let scheduleLabel = 'log cleanup scheduled.';
if (cronExpression === '0 0 * * 0') {
  scheduleLabel = 'WEEKLY log cleanup scheduled.';
} else if (cronExpression === '0 0 * * *') {
  scheduleLabel = 'DAILY log cleanup scheduled.';
} else if (cronExpression === '* * * * *') {
  scheduleLabel = 'EVERY MINUTE log cleanup scheduled.';
} else {
  scheduleLabel = `log cleanup scheduled by cron: "${cronExpression}"`;
}

// Schedule the job
cron.schedule(cronExpression, () => {
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

// 📢 Log based on expression
console.log(`🕒 Cron job for ${scheduleLabel}`);
