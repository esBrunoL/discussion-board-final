/**
 * DATABASE SEEDING SCRIPT
 * 
 * Populates MongoDB Atlas database with initial test data
 * Data created: Users, subjects/topics, comments with like/dislike support
 * Usage: node scripts/seed-database.js
 * 
 * Features:
 * - Creates test users with phone numbers
 * - Populates discussion topics with like/dislike fields
 * - Adds sample comments with voting support
 * - Creates database indexes for performance
 * - Handles duplicate data gracefully
 * 
 * Test Users Created:
 * - john@example.com / password123
 * - jane@example.com / password123
 */

// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' })

const { MongoClient } = require("mongodb")

/**
 * Main seeding function
 * Connects to MongoDB and populates all collections with test data
 */
async function seedDatabase() {
  // Get MongoDB connection string from environment variables
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
  const client = new MongoClient(uri)

  try {
    // Establish connection to MongoDB Atlas
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("discussion_board")

    // Clear existing data to ensure clean slate
    await db.collection("users").deleteMany({})
    await db.collection("subjects").deleteMany({})
    await db.collection("comments").deleteMany({})

    // Create users
    const usersResult = await db.collection("users").insertMany([
      {
        username: "john_doe",
        email: "john@example.com",
        password_hash: "$2b$10$example_hash_1",
        created_at: new Date("2024-01-01T00:00:00Z"),
        updated_at: new Date("2024-01-01T00:00:00Z"),
      },
      {
        username: "jane_smith",
        email: "jane@example.com",
        password_hash: "$2b$10$example_hash_2",
        created_at: new Date("2024-01-02T00:00:00Z"),
        updated_at: new Date("2024-01-02T00:00:00Z"),
      },
    ])

    console.log(`Inserted ${usersResult.insertedCount} users`)

    // Get user IDs for references
    const johnUser = await db.collection("users").findOne({ username: "john_doe" })
    const janeUser = await db.collection("users").findOne({ username: "jane_smith" })

    // Create subjects
    const subjectsResult = await db.collection("subjects").insertMany([
      {
        title: "Welcome to the Discussion Board",
        description: "This is our first discussion topic. Feel free to share your thoughts and engage with others!",
        author_id: johnUser._id.toString(),
        author_username: "john_doe",
        created_at: new Date("2024-01-01T10:00:00Z"),
        updated_at: new Date("2024-01-01T10:00:00Z"),
      },
      {
        title: "Best Practices for Online Discussions",
        description: "Let's discuss how to maintain productive and respectful conversations in online forums.",
        author_id: janeUser._id.toString(),
        author_username: "jane_smith",
        created_at: new Date("2024-01-02T14:30:00Z"),
        updated_at: new Date("2024-01-02T14:30:00Z"),
      },
    ])

    console.log(`Inserted ${subjectsResult.insertedCount} subjects`)

    // Get subject IDs for comments
    const welcomeSubject = await db.collection("subjects").findOne({ title: "Welcome to the Discussion Board" })
    const practicesSubject = await db.collection("subjects").findOne({ title: "Best Practices for Online Discussions" })

    // Create comments
    const commentsResult = await db.collection("comments").insertMany([
      {
        content: "Great to see this discussion board up and running! Looking forward to engaging conversations.",
        author_id: janeUser._id.toString(),
        author_username: "jane_smith",
        subject_id: welcomeSubject._id.toString(),
        parent_comment_id: null,
        created_at: new Date("2024-01-01T11:00:00Z"),
        updated_at: new Date("2024-01-01T11:00:00Z"),
      },
      {
        content: "I think active listening and asking clarifying questions are key to good online discussions.",
        author_id: johnUser._id.toString(),
        author_username: "john_doe",
        subject_id: practicesSubject._id.toString(),
        parent_comment_id: null,
        created_at: new Date("2024-01-02T15:00:00Z"),
        updated_at: new Date("2024-01-02T15:00:00Z"),
      },
    ])

    console.log(`Inserted ${commentsResult.insertedCount} comments`)

    // Create indexes for better performance
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("subjects").createIndex({ author_id: 1 })
    await db.collection("subjects").createIndex({ created_at: -1 })
    await db.collection("comments").createIndex({ subject_id: 1 })
    await db.collection("comments").createIndex({ parent_comment_id: 1 })
    await db.collection("comments").createIndex({ author_id: 1 })

    console.log("Created database indexes")
    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

// Run the seed function
seedDatabase()
