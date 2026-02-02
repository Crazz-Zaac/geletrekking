const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Construct MongoDB URI dynamically from environment variables
    let mongoUri;
    
    if (process.env.MONGO_URI) {
      // Use MONGO_URI if provided (for flexibility)
      mongoUri = process.env.MONGO_URI;
    } else if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD) {
      // Construct URI from individual components (RECOMMENDED)
      const username = encodeURIComponent(process.env.MONGO_USERNAME);
      const password = encodeURIComponent(process.env.MONGO_PASSWORD);
      const host = process.env.MONGO_HOST || 'mongo';
      const port = process.env.MONGO_PORT || '27017';
      const database = process.env.MONGO_DATABASE || 'geletrekking';
      const authSource = process.env.MONGO_AUTH_SOURCE || 'admin';
      
      mongoUri = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}`;
    } else {
      throw new Error('MongoDB configuration missing. Provide either MONGO_URI or MONGO_USERNAME/MONGO_PASSWORD');
    }
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
