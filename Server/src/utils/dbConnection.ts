/**
 * Database connection utility for Vercel serverless functions.
 * Ensures MongoDB connection is established before handling requests.
 */
import mongoose from 'mongoose';

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global cache to store connection
let cached: ConnectionCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with caching for serverless environments.
 * Reuses existing connections to avoid reconnection on every function invocation.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // If we have a cached connection and it's connected, return it
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  // If we don't have a promise, create one
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      bufferCommands: false, // Disable mongoose buffering for serverless
      bufferMaxEntries: 0,   // Disable mongoose buffering for serverless
    };

    console.log('Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('Connected to MongoDB successfully');
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }
}

/**
 * Middleware to ensure database connection before handling requests.
 */
export const ensureDbConnection = async (req: any, res: any, next: any) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown database error'
    });
  }
};
