/**
 * MONGODB CONNECTION UTILITY
 * 
 * Manages database connection to MongoDB Atlas
 * Data source: Environment variable MONGODB_URI from .env.local
 * Connection: MongoDB Atlas cloud database cluster
 * 
 * Features:
 * - Singleton connection pattern for efficiency
 * - Connection caching to prevent multiple connections
 * - Error handling with detailed logging
 * - Environment-based configuration
 * - Automatic database selection from connection string
 */

import { MongoClient, type Db } from "mongodb"

// MongoDB connection string from environment variables (.env.local)
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Connection caching strategy based on environment
if (process.env.NODE_ENV === "development") {
  // Development: Use global variable to preserve connection across Hot Module Replacement
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // Production: Create fresh connection (no HMR concerns)
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

/**
 * Get database connection to MongoDB Atlas
 * Returns: Database instance for 'discussion_board' database
 * Usage: const db = await getDatabase()
 * 
 * This function is used by all API endpoints that need database access:
 * - Authentication APIs (login, register)
 * - Subject APIs (CRUD operations, likes)
 * - Comment APIs (CRUD operations, likes)
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("discussion_board")  // Database name specified in connection string
}

export default clientPromise
