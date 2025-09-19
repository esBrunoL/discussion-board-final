/**
 * SUBJECT LIKE/DISLIKE API ENDPOINT
 * 
 * Handles voting (like/dislike) on discussion topics/subjects
 * Data source: MongoDB Atlas subjects collection
 * User input: userId and action (like/dislike/remove) from LikeDislikeButtons component
 * 
 * Features:
 * - Each user can only like OR dislike once per subject
 * - Smart vote switching: like→dislike changes counter by -2
 * - Real-time counter updates with net score (likes - dislikes)
 * - Prevents duplicate votes by tracking user IDs in arrays
 * - Returns updated like count and user's current vote status
 */

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

/**
 * POST /api/subjects/[id]/like
 * 
 * Processes like/dislike actions on subjects
 * Data flow: LikeDislikeButtons → API → MongoDB → Updated UI
 * User data: userId from auth context, action from button click
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract user vote data from request (sent from LikeDislikeButtons component)
    const { userId, action } = await request.json()

    // Validate required fields
    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action are required" }, { status: 400 })
    }

    // Validate action type (like/dislike/remove)
    if (!["like", "dislike", "remove"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'like', 'dislike', or 'remove'" }, { status: 400 })
    }

    const db = await getDatabase()
    const subjectId = params.id

    // Get the current subject from MongoDB with existing vote data
    const subject = await db.collection("subjects").findOne({ _id: new ObjectId(subjectId) })
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    let updateOperation = {}
    let likeCountChange = 0

    // Check current user vote status from database arrays
    const isCurrentlyLiked = subject.liked_by?.includes(userId) || false
    const isCurrentlyDisliked = subject.disliked_by?.includes(userId) || false

    // Smart voting logic: handles like/dislike/remove with counter mathematics
    switch (action) {
      case "like":
        if (isCurrentlyLiked) {
          // User already liked, so remove like (toggle off)
          updateOperation = {
            $pull: { liked_by: userId },
            $inc: { like_count: -1 }
          }
        } else {
          // Add like, remove dislike if exists (vote switching)
          if (isCurrentlyDisliked) {
            updateOperation = {
              $addToSet: { liked_by: userId },
              $pull: { disliked_by: userId },
              $inc: { like_count: 2 } // +1 for like, +1 for removing dislike
            }
          } else {
            updateOperation = {
              $addToSet: { liked_by: userId },
              $inc: { like_count: 1 }
            }
          }
        }
        break

      case "dislike":
        if (isCurrentlyDisliked) {
          // User already disliked, so remove dislike (toggle off)
          updateOperation = {
            $pull: { disliked_by: userId },
            $inc: { like_count: 1 }
          }
        } else {
          // Add dislike, remove like if exists (vote switching)
          if (isCurrentlyLiked) {
            updateOperation = {
              $addToSet: { disliked_by: userId },
              $pull: { liked_by: userId },
              $inc: { like_count: -2 } // -1 for removing like, -1 for adding dislike
            }
          } else {
            updateOperation = {
              $addToSet: { disliked_by: userId },
              $inc: { like_count: -1 }
            }
          }
        }
        break

      case "remove":
        // Remove any existing vote (used for cleanup)
        if (isCurrentlyLiked) {
          updateOperation = {
            $pull: { liked_by: userId },
            $inc: { like_count: -1 }
          }
        } else if (isCurrentlyDisliked) {
          updateOperation = {
            $pull: { disliked_by: userId },
            $inc: { like_count: 1 }
          }
        }
        break
    }

    // Update the subject in MongoDB with new vote data
    const result = await db.collection("subjects").updateOne(
      { _id: new ObjectId(subjectId) },
      {
        ...updateOperation,
        $set: { updated_at: new Date() }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    // Get updated subject to return current state to frontend
    const updatedSubject = await db.collection("subjects").findOne({ _id: new ObjectId(subjectId) })

    // Return response data for LikeDislikeButtons component to update UI
    return NextResponse.json({
      success: true,
      like_count: updatedSubject?.like_count || 0,
      user_liked: updatedSubject?.liked_by?.includes(userId) || false,
      user_disliked: updatedSubject?.disliked_by?.includes(userId) || false
    })

  } catch (error) {
    console.error("Like/dislike error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}