/**
 * MongoDB connection — Mongoose + native client
 * Patrón singleton para hot-reload en dev y reuso en serverless.
 */
import mongoose, { Connection } from "mongoose";
import { MongoClient } from "mongodb";

function getUri(): string {
  const u = process.env.MONGODB_URI;
  if (!u) throw new Error("Falta MONGODB_URI en variables de entorno");
  return u;
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
      .connect(getUri(), {
        bufferCommands: false,
        dbName: process.env.MONGODB_DB || "misfinanzas",
      })
      .then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ---------- MongoClient (para Auth.js adapter) ----------
function getClientPromise(): Promise<MongoClient> {
  if (!global.mongoClientPromise) {
    global.mongoClientPromise = new MongoClient(getUri(), { maxPoolSize: 10 }).connect();
  }
  return global.mongoClientPromise;
}

// Proxy thenable: only triggers connect when actually awaited.
const clientPromise = {
  then: (...args: Parameters<Promise<MongoClient>["then"]>) => getClientPromise().then(...args),
  catch: (...args: Parameters<Promise<MongoClient>["catch"]>) => getClientPromise().catch(...args),
  finally: (...args: Parameters<Promise<MongoClient>["finally"]>) => getClientPromise().finally(...args),
} as Promise<MongoClient>;

export default clientPromise;
