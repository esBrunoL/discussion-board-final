import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface Subject {
  id: number
  title: string
  description: string
  author_id: number
  author_username?: string
  created_at: string
  updated_at: string
  comment_count?: number
  like_count?: number
  liked_by?: string[]
  disliked_by?: string[]
  user_liked?: boolean
  user_disliked?: boolean
}

export interface Comment {
  id: number
  content: string
  author_id: number
  author_username?: string
  subject_id: number
  parent_comment_id: number | null
  created_at: string
  updated_at: string
  replies?: Comment[]
  like_count?: number
  liked_by?: string[]
  disliked_by?: string[]
  user_liked?: boolean
  user_disliked?: boolean
}

// Mock data for development
export const mockUsers: User[] = [
  {
    id: 1,
    username: "john_doe",
    email: "john@example.com",
    password_hash: "hashed_password_1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "jane_smith",
    email: "jane@example.com",
    password_hash: "hashed_password_2",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  },
]

export const mockSubjects: Subject[] = [
  {
    id: 1,
    title: "Welcome to the Discussion Board",
    description: "This is our first discussion topic. Feel free to share your thoughts and engage with others!",
    author_id: 1,
    author_username: "john_doe",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    comment_count: 3,
  },
  {
    id: 2,
    title: "Best Practices for Online Discussions",
    description: "Let's discuss how to maintain productive and respectful conversations in online forums.",
    author_id: 2,
    author_username: "jane_smith",
    created_at: "2024-01-02T14:30:00Z",
    updated_at: "2024-01-02T14:30:00Z",
    comment_count: 1,
  },
]

export const mockComments: Comment[] = [
  {
    id: 1,
    content: "Great to see this discussion board up and running! Looking forward to engaging conversations.",
    author_id: 2,
    author_username: "jane_smith",
    subject_id: 1,
    parent_comment_id: null,
    created_at: "2024-01-01T11:00:00Z",
    updated_at: "2024-01-01T11:00:00Z",
  },
  {
    id: 2,
    content: "I agree! This platform looks very promising for meaningful discussions.",
    author_id: 1,
    author_username: "john_doe",
    subject_id: 1,
    parent_comment_id: 1,
    created_at: "2024-01-01T11:30:00Z",
    updated_at: "2024-01-01T11:30:00Z",
  },
  {
    id: 3,
    content: "Welcome everyone! Let's keep our discussions respectful and constructive.",
    author_id: 1,
    author_username: "john_doe",
    subject_id: 1,
    parent_comment_id: null,
    created_at: "2024-01-01T12:00:00Z",
    updated_at: "2024-01-01T12:00:00Z",
  },
  {
    id: 4,
    content: "I think active listening and asking clarifying questions are key to good online discussions.",
    author_id: 1,
    author_username: "john_doe",
    subject_id: 2,
    parent_comment_id: null,
    created_at: "2024-01-02T15:00:00Z",
    updated_at: "2024-01-02T15:00:00Z",
  },
]

// In-memory storage for development (replace with real database later)
// const users = [...mockUsers]
// const subjects = [...mockSubjects]
// const comments = [...mockComments]
// let nextUserId = 3
// let nextSubjectId = 3
// let nextCommentId = 5

export async function getUsers() {
  const db = await getDatabase()
  return await db.collection("users").find({}).toArray()
}

export async function getUserByEmail(email: string) {
  const db = await getDatabase()
  return await db.collection("users").findOne({ email })
}

export async function getUserById(id: string) {
  const db = await getDatabase()
  return await db.collection("users").findOne({ _id: new ObjectId(id) })
}

export async function createUser(userData: Omit<User, "id" | "created_at" | "updated_at">) {
  const db = await getDatabase()
  const now = new Date().toISOString()
  const result = await db.collection("users").insertOne({
    ...userData,
    created_at: now,
    updated_at: now,
  })
  return result.insertedId.toString()
}

export async function getSubjects() {
  const db = await getDatabase()
  const subjects = await db.collection("subjects").find({}).toArray()

  // Add comment count to each subject
  const subjectsWithCounts = await Promise.all(
    subjects.map(async (subject) => {
      const commentCount = await db.collection("comments").countDocuments({ subject_id: subject._id })
      return {
        ...subject,
        id: subject._id.toString(),
        comment_count: commentCount,
      }
    }),
  )

  return subjectsWithCounts
}

export async function getSubjectById(id: string) {
  const db = await getDatabase()
  const subject = await db.collection("subjects").findOne({ _id: new ObjectId(id) })
  if (!subject) return null

  return {
    ...subject,
    id: subject._id.toString(),
  }
}

export async function createSubject(subjectData: Omit<Subject, "id" | "created_at" | "updated_at" | "comment_count">) {
  const db = await getDatabase()
  const now = new Date().toISOString()
  const result = await db.collection("subjects").insertOne({
    ...subjectData,
    created_at: now,
    updated_at: now,
  })
  return result.insertedId.toString()
}

export async function getCommentsBySubjectId(subjectId: string) {
  const db = await getDatabase()
  return await db
    .collection("comments")
    .find({ subject_id: new ObjectId(subjectId) })
    .toArray()
}

export async function createComment(commentData: Omit<Comment, "id" | "created_at" | "updated_at">) {
  const db = await getDatabase()
  const now = new Date().toISOString()
  const result = await db.collection("comments").insertOne({
    ...commentData,
    subject_id: new ObjectId(commentData.subject_id.toString()),
    parent_comment_id: commentData.parent_comment_id ? new ObjectId(commentData.parent_comment_id.toString()) : null,
    created_at: now,
    updated_at: now,
  })
  return result.insertedId.toString()
}
