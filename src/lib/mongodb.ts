/**
 * MongoDB connection — Mongoose + native client
 * Patrón singleton para hot-reload en dev y reuso en serverless.
 */
import mongoose, { Connection } from "mongoose";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Falta MONGODB_URI en variables de entorno");
}

// ---------- Mongoose (para modelos) ----------
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

const cached: MongooseCache =
  global.mongooseCache ?? (global.mongooseCache = { conn: null, promise: null });

export async function dbConnect(): Promise<Connection> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, {
        bufferCommands: false,
        dbName: process.env.MONGODB_DB || "misfinanzas",
      })
      .then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ---------- MongoClient (para Auth.js adapter) ----------
const clientPromise: Promise<MongoClient> =
  global.mongoClientPromise ??
  (global.mongoClientPromise = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
  }).connect());

export default clientPromise;
