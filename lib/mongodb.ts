import mongoose from 'mongoose';

const MONGODB_URI: string = "mongodb://localhost:27018/js-seekho";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Define the type for our cached connection
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Type for global object extension
interface CustomGlobal {
  mongoose?: CachedConnection;
}

// Extend the global object to include our mongoose cache
declare const globalThis: CustomGlobal & typeof global;

/** 
 * Cached connection for MongoDB.
 */
let cached: CachedConnection = globalThis.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;