import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string, commentId: string } }) {
  try {
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action are required" }, { status: 400 })
    }

    if (!["like", "dislike", "remove"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'like', 'dislike', or 'remove'" }, { status: 400 })
    }

    const db = await getDatabase()
    const commentId = params.commentId

    // Get the current comment
    const comment = await db.collection("comments").findOne({ _id: new ObjectId(commentId) })
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    let updateOperation = {}

    const isCurrentlyLiked = comment.liked_by?.includes(userId) || false
    const isCurrentlyDisliked = comment.disliked_by?.includes(userId) || false

    switch (action) {
      case "like":
        if (isCurrentlyLiked) {
          // User already liked, so remove like
          updateOperation = {
            $pull: { liked_by: userId },
            $inc: { like_count: -1 }
          }
        } else {
          // Add like, remove dislike if exists
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
          // User already disliked, so remove dislike
          updateOperation = {
            $pull: { disliked_by: userId },
            $inc: { like_count: 1 }
          }
        } else {
          // Add dislike, remove like if exists
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

    // Update the comment
    const result = await db.collection("comments").updateOne(
      { _id: new ObjectId(commentId) },
      {
        ...updateOperation,
        $set: { updated_at: new Date() }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Get updated comment to return current state
    const updatedComment = await db.collection("comments").findOne({ _id: new ObjectId(commentId) })

    return NextResponse.json({
      success: true,
      like_count: updatedComment?.like_count || 0,
      user_liked: updatedComment?.liked_by?.includes(userId) || false,
      user_disliked: updatedComment?.disliked_by?.includes(userId) || false
    })

  } catch (error) {
    console.error("Comment like/dislike error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}