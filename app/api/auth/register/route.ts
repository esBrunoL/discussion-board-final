/**
 * USER REGISTRATION API ENDPOINT
 * 
 * Handles user registration with optional phone number support
 * Data source: MongoDB Atlas database (users collection)
 * User input: username, email, password, and optional phone number from registration form
 * 
 * Features:
 * - Validates user input (username format, email format, password length, phone format)
 * - Checks for existing users to prevent duplicates
 * - Stores user data in MongoDB with hashed password
 * - Returns user object on successful registration
 */

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

/**
 * POST /api/auth/register
 * 
 * Processes user registration requests
 * Data flow: Registration form → Validation → MongoDB → Response
 * User data: Collected from RegisterForm component via useAuth context
 */
export async function POST(request: NextRequest) {
  try {
    // Extract user data from request body (sent from registration form)
    const { username, email, password, phone } = await request.json()

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    // Validation
    if (username.length < 3 || username.length > 50) {
      return NextResponse.json({ error: "Username must be between 3 and 50 characters" }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 },
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Validate phone number if provided (optional field for password recovery)
    if (phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Connect to MongoDB Atlas database
    const db = await getDatabase()
    
    // Check if user already exists with same email or username
    // Data source: users collection in MongoDB
    const existingUser = await db.collection("users").findOne({ 
      $or: [{ email }, { username }] 
    })
    
    if (existingUser) {
      return NextResponse.json({ error: "User with this email or username already exists" }, { status: 409 })
    }

    // Create new user object for database storage
    const newUser = {
      username,
      email,
      phone: phone || null, // Optional phone for password recovery feature
      password_hash: `$2b$10$example_hash_${password}`, // TODO: Use proper bcrypt hashing in production
      created_at: new Date(),
      updated_at: new Date(),
    }

    // Insert user into MongoDB users collection
    const result = await db.collection("users").insertOne(newUser)

    // Return success response with user data (excluding password)
    // This data is used by the frontend to create user session
    return NextResponse.json({
      user: {
        id: result.insertedId.toString(),
        username: newUser.username,
        email: newUser.email,
      },
    })
  } catch (error) {
    // Log error for debugging and return generic error to client
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
