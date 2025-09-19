// MongoDB seed script - Run this in MongoDB shell or MongoDB Compass
// Use this to populate your MongoDB database with initial data

// Declare use and db variables
const use = db.getSiblingDB
const db = use("discussion_board")

// Create users collection
db.users.insertMany([
  {
    username: "john_doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    password_hash: "$2b$10$example_hash_1",
    created_at: new Date("2024-01-01T00:00:00Z"),
    updated_at: new Date("2024-01-01T00:00:00Z"),
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    phone: "+1-555-0456",
    password_hash: "$2b$10$example_hash_2",
    created_at: new Date("2024-01-02T00:00:00Z"),
    updated_at: new Date("2024-01-02T00:00:00Z"),
  },
])

// Get user IDs for references
const johnUser = db.users.findOne({ username: "john_doe" })
const janeUser = db.users.findOne({ username: "jane_smith" })

// Create subjects collection
db.subjects.insertMany([
  {
    title: "Welcome to the Discussion Board",
    description: "This is our first discussion topic. Feel free to share your thoughts and engage with others!",
    author_id: johnUser._id.toString(),
    author_username: "john_doe",
    like_count: 0,
    liked_by: [],
    disliked_by: [],
    created_at: new Date("2024-01-01T10:00:00Z"),
    updated_at: new Date("2024-01-01T10:00:00Z"),
  },
  {
    title: "Best Practices for Online Discussions",
    description: "Let's discuss how to maintain productive and respectful conversations in online forums.",
    author_id: janeUser._id.toString(),
    author_username: "jane_smith",
    like_count: 0,
    liked_by: [],
    disliked_by: [],
    created_at: new Date("2024-01-02T14:30:00Z"),
    updated_at: new Date("2024-01-02T14:30:00Z"),
  },
])

// Get subject IDs for comments
const welcomeSubject = db.subjects.findOne({ title: "Welcome to the Discussion Board" })
const practicesSubject = db.subjects.findOne({ title: "Best Practices for Online Discussions" })

// Create comments collection
db.comments.insertMany([
  {
    content: "Great to see this discussion board up and running! Looking forward to engaging conversations.",
    author_id: janeUser._id.toString(),
    author_username: "jane_smith",
    subject_id: welcomeSubject._id.toString(),
    parent_comment_id: null,
    like_count: 0,
    liked_by: [],
    disliked_by: [],
    created_at: new Date("2024-01-01T11:00:00Z"),
    updated_at: new Date("2024-01-01T11:00:00Z"),
  },
  {
    content: "I think active listening and asking clarifying questions are key to good online discussions.",
    author_id: johnUser._id.toString(),
    author_username: "john_doe",
    subject_id: practicesSubject._id.toString(),
    parent_comment_id: null,
    like_count: 0,
    liked_by: [],
    disliked_by: [],
    created_at: new Date("2024-01-02T15:00:00Z"),
    updated_at: new Date("2024-01-02T15:00:00Z"),
  },
])

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.subjects.createIndex({ author_id: 1 })
db.subjects.createIndex({ created_at: -1 })
db.comments.createIndex({ subject_id: 1 })
db.comments.createIndex({ parent_comment_id: 1 })
db.comments.createIndex({ author_id: 1 })

print("Database seeded successfully!")
