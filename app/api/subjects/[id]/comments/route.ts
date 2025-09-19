import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const db = await getDatabase()
    const subjectId = new ObjectId(params.id)

    // Get all comments for this subject with user like status
    const comments = await db.collection("comments").find({ 
      subject_id: subjectId.toString() 
    }).toArray()

    // Add user like status and convert _id to id
    const commentsWithUserStatus = comments.map(comment => ({
      ...comment,
      id: comment._id.toString(),
      user_liked: userId ? (comment.liked_by || []).includes(userId) : false,
      user_disliked: userId ? (comment.disliked_by || []).includes(userId) : false,
      liked_by: undefined, // Remove from response
      disliked_by: undefined, // Remove from response
    }))

    return NextResponse.json({ comments: commentsWithUserStatus })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { content, author_id, author_username, parent_comment_id } = await request.json()

    if (!content || !author_id || !author_username) {
      return NextResponse.json({ error: "Content, author_id, and author_username are required" }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Comment must be 1000 characters or less" }, { status: 400 })
    }

    const db = await getDatabase()
    const subjectId = params.id

    const newComment = {
      content: content.trim(),
      author_id,
      author_username,
      subject_id: subjectId,
      parent_comment_id: parent_comment_id || null,
      like_count: 0,
      liked_by: [],
      disliked_by: [],
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("comments").insertOne(newComment)

    return NextResponse.json({ 
      comment: {
        ...newComment,
        id: result.insertedId.toString(),
      }
    })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
