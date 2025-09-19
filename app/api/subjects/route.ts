import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const db = await getDatabase()
    
    // Get all subjects with aggregation to include comment counts and user like status
    const pipeline = [
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "subject_id",
          as: "comments"
        }
      },
      {
        $addFields: {
          id: "$_id",
          comment_count: { $size: "$comments" },
          user_liked: userId ? { $in: [userId, "$liked_by"] } : false,
          user_disliked: userId ? { $in: [userId, "$disliked_by"] } : false
        }
      },
      {
        $project: {
          comments: 0,
          liked_by: 0,
          disliked_by: 0
        }
      },
      {
        $sort: { created_at: -1 }
      }
    ]

    const subjects = await db.collection("subjects").aggregate(pipeline).toArray()

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error("Get subjects error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, author_id, author_username } = await request.json()

    if (!title || !author_id || !author_username) {
      return NextResponse.json({ error: "Title, author_id, and author_username are required" }, { status: 400 })
    }

    if (title.length > 200) {
      return NextResponse.json({ error: "Title must be 200 characters or less" }, { status: 400 })
    }

    if (description && description.length > 1000) {
      return NextResponse.json({ error: "Description must be 1000 characters or less" }, { status: 400 })
    }

    const db = await getDatabase()
    
    const newSubject = {
      title: title.trim(),
      description: description?.trim() || "",
      author_id,
      author_username,
      like_count: 0,
      liked_by: [],
      disliked_by: [],
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("subjects").insertOne(newSubject)

    return NextResponse.json({ 
      subject: {
        id: result.insertedId.toString(),
        ...newSubject,
        comment_count: 0,
      }
    })
  } catch (error) {
    console.error("Create subject error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
