import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    console.log('[Database] MONGODB_URI is not configured with a valid mongodb:// or mongodb+srv:// connection string. Running with local persistent database.');
    return false;
  }

  try {
    // Connect with a 5s timeout and dedicated DB name
    await mongoose.connect(uri, {
      dbName: 'salem_rice_maligai',
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log('[Database] Successfully connected to MongoDB Atlas (Database: salem_rice_maligai).');
    return true;
  } catch (err: any) {
    // Clear server-side error without exposing credentials or stack trace
    console.error(`[MONGODB ERROR]\nMESSAGE: ${err.message || 'Connection error'}`);
    console.log('[Database] Falling back to local persistent store for smooth operation.');
    return false;
  }
}

mongoose.connection.on('error', (err: any) => {
  console.error(`[MONGODB ERROR]\nMESSAGE: ${err.message || 'Mongoose runtime error'}`);
});

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export default connectDB;
