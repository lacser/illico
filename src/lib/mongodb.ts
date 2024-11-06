import mongoose from 'mongoose';

interface GlobalMongo {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: GlobalMongo | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongooseGlobal;

if (!cached) {
  cached = global.mongooseGlobal = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (cached?.conn) {
    return cached.conn;
  }

  cached!.promise = mongoose.connect(MONGODB_URI);

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectDB;
