import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    console.log(`✅ Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('❌ Error details:', error);
    console.warn('⚠️ The app will continue running, but database-dependent routes may fail until MongoDB becomes available.');
    return false;
  }
};

export default connectDB;

