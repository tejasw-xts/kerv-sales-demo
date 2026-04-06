const mongoose = require('mongoose');

async function connectDatabase() {
  const candidateUris = [
    process.env.MONGO_URI,
    'mongodb://localhost:27017/kerv-sales-demo',
    'mongodb://127.0.0.1:27017/kerv-sales-demo',
  ].filter(Boolean);

  for (const mongoUri of candidateUris) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB connected: ${mongoUri}`);
      return true;
    } catch (error) {
      console.warn(`MongoDB connection failed for ${mongoUri}: ${error.message}`);
    }
  }

  console.warn('Using local file storage fallback because MongoDB is unavailable.');
  return false;
}

module.exports = { connectDatabase };
