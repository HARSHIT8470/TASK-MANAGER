const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('💡 Fix: Make sure MongoDB is running locally OR set a valid Atlas URI in server/.env');
    console.error('   Local:  mongodb://localhost:27017/taskmanager');
    console.error('   Atlas:  mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskmanager');
    process.exit(1);
  }
};

module.exports = connectDB;
