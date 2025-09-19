/**
 * USER LOGIN API ENDPOINT
 * 
 * Handles user authentication and login
 * Data source: MongoDB Atlas database (users collection)
 * User input: email and password from login form
 * 
 * Features:
 * - Validates user credentials against database
 * - Returns user data on successful authentication
 * - Uses demo password matching for development (password123 for all users)
 * - TODO: Implement proper bcrypt password verification in production
 */

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Connect to MongoDB
    const db = await getDatabase()
    
    // Find user by email
    const user = await db.collection("users").findOne({ email })
    
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // For demo purposes, we'll check against the seeded password hashes
    // In production, use proper password hashing like bcrypt
    const validPasswords = {
      "john@example.com": "password123", // Demo password for john_doe
      "jane@example.com": "password123"  // Demo password for jane_smith
    }

    if (!validPasswords[email as keyof typeof validPasswords] || 
        validPasswords[email as keyof typeof validPasswords] !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user data without password
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
